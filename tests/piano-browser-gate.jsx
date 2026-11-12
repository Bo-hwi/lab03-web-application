// Test-only instrumentation. Never imported by production App.
import { Profiler, useEffect, useId, useState } from "react";
import { PianoKeyboard } from "../src/homeworks/GrandPiano88/PianoKeyboard.jsx";
import { PianoKey } from "../src/homeworks/GrandPiano88/PianoKey.jsx";
import { PolyphonicSynth } from "../src/homeworks/GrandPiano88/audio/PolyphonicSynth.js";
import keyStyles from "../src/homeworks/GrandPiano88/PianoKeyboard.module.css";
import "./piano-browser-gate.css";

const commits = [];
const renders = [];
const errors = [];
const nativeEvents = [];
const audioRecords = [];
const engines = [];
let keyboardEngine = null;
let lastKeyFocus = null;
let failStartup = false;
let cancelNext = false;
const POINTER_TYPES = ["pointerdown", "pointermove", "pointerup", "pointercancel", "pointerout", "lostpointercapture"];
const wait = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));

// Keep the existing React.memo object/default comparator and instrument only its
// inner render in this isolated fixture. This measures committed subtree updates,
// not DevTools timings or production performance. StrictMode invocations counted separately.
const OriginalKey = PianoKey.type;
PianoKey.type = function MeasuredPianoKey(props) {
  renders.push(props.note.midi);
  return <Profiler id={String(props.note.midi)} onRender={(id, phase, actualDuration) => {
    commits.push({ midi: Number(id), phase, actualDuration });
  }}>{OriginalKey(props)}</Profiler>;
};

function measuredContext() {
  if (failStartup) throw new Error("Gate injected audio initialization failure");
  const context = new AudioContext();
  const analyser = context.createAnalyser();
  analyser.fftSize = 2048;
  analyser.connect(context.destination);
  const record = { context, analyser, oscillators: [], ended: 0, initialState: context.state,
    userGestureActive: navigator.userActivation?.isActive ?? null, resumeCalls: 0 };
  audioRecords.push(record);
  return {
    get currentTime() { return context.currentTime; },
    get state() { return context.state; },
    destination: analyser,
    createGain: () => context.createGain(),
    createOscillator: () => {
      const node = context.createOscillator();
      record.oscillators.push(node);
      node.addEventListener("ended", () => { record.ended += 1; }, { once: true });
      return node;
    },
    resume: () => { record.resumeCalls += 1; return context.resume(); },
    close: async () => { analyser.disconnect(); await context.close(); },
  };
}

function createMeasuredSynth() {
  const engine = new PolyphonicSynth({ createContext: measuredContext });
  engines.push(engine);
  return engine;
}

function createKeyboardSynth() {
  keyboardEngine = createMeasuredSynth();
  return keyboardEngine;
}

function metadata() {
  return { url: location.href, userAgent: navigator.userAgent,
    viewport: [innerWidth, innerHeight], documentWidth: document.documentElement.scrollWidth,
    date: new Date().toISOString() };
}

function key(midi) { return document.querySelector(`button[data-midi="${midi}"]`); }
function keyboard(midi, type, code = "Enter", repeat = false) {
  return key(midi).dispatchEvent(new KeyboardEvent(type, { code, repeat, bubbles: true, cancelable: true }));
}
function releaseKeys() {
  for (let midi = 21; midi <= 108; midi += 1) {
    keyboard(midi, "keyup", "Enter"); keyboard(midi, "keyup", "Space");
  }
}
function rms(record) {
  const samples = new Float32Array(record.analyser.fftSize);
  record.analyser.getFloatTimeDomainData(samples);
  return Math.sqrt(samples.reduce((sum, sample) => sum + sample * sample, 0) / samples.length);
}
// A freshly created context can report "running" before its first render quantum
// reaches the analyser, so poll instead of trusting one fixed-delay sample.
async function waitForSignal(record, timeoutMs = 600) {
  const started = performance.now();
  let value = rms(record);
  while (value <= 0.00001 && performance.now() - started < timeoutMs) {
    await wait(20);
    value = rms(record);
  }
  return { rms: value, waitedMs: Math.round(performance.now() - started), contextTime: record.context.currentTime };
}
function pressed() { return [...document.querySelectorAll('[data-midi][aria-pressed="true"]')].map((node) => Number(node.dataset.midi)); }

export function PianoBrowserGate() {
  const cancelId = useId();
  const [report, setReport] = useState({ status: "READY - tests not run" });
  const [mounted, setMounted] = useState(true);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const sampleTimers = new Set();
    const later = (callback) => {
      const timer = setTimeout(() => { sampleTimers.delete(timer); callback(); }, 80);
      sampleTimers.add(timer);
    };
    const onError = (event) => errors.push(event.message ?? String(event.reason));
    const originalError = console.error;
    console.error = (...args) => { errors.push(args.map(String).join(" ")); originalError(...args); };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onError);
    let outsideLogged = false;
    const onPointer = (event) => {
      const keyNode = event.target.closest?.("[data-midi]");
      if (!keyNode) return;
      const bounds = keyNode.getBoundingClientRect();
      const inside = event.clientX >= bounds.left && event.clientX <= bounds.right &&
        event.clientY >= bounds.top && event.clientY <= bounds.bottom;
      if (event.type === "pointerdown") outsideLogged = false;
      // Capture-phase listener runs before React releases capture. Record only the
      // first captured move outside the key bounds to keep evidence small.
      if (event.type === "pointermove") {
        if (inside || outsideLogged || !keyNode.hasPointerCapture?.(event.pointerId)) return;
        outsideLogged = true;
      }
      const sample = { type: event.type === "pointermove" ? "pointermove-outside" : event.type,
        trusted: event.isTrusted, pointerId: event.pointerId, pointerType: event.pointerType,
        midi: Number(keyNode.dataset.midi), inside, pressedBefore: pressed() };
      nativeEvents.push(sample);
      later(() => { sample.pressedAfter = pressed(); sample.activeAfter = keyboardEngine?.activeVoices.map((token) => token.midi) ?? []; });
      if (event.type === "pointerdown" && cancelNext) {
        cancelNext = false;
        const target = event.target.closest("[data-midi]");
        // A microtask would run before React's root pointerdown handler, so the
        // cancel would precede the press. Dispatch after the press is committed.
        const timer = setTimeout(() => {
          sampleTimers.delete(timer);
          target.dispatchEvent(new PointerEvent("pointercancel", {
            bubbles: true, pointerId: event.pointerId, pointerType: event.pointerType,
          }));
        }, 30);
        sampleTimers.add(timer);
      }
    };
    const onFocus = (event) => {
      const node = event.target.closest?.("button[data-midi]");
      if (!node) return;
      const style = getComputedStyle(node);
      lastKeyFocus = { midi: Number(node.dataset.midi), focusVisible: node.matches(":focus-visible"),
        outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth, outlineColor: style.outlineColor,
        bounds: { left: node.getBoundingClientRect().left, right: node.getBoundingClientRect().right } };
    };
    const onBlur = (event) => {
      const sample = { type: "window-blur", trusted: event.isTrusted };
      nativeEvents.push(sample);
      later(() => { sample.pressedAfter = pressed(); sample.activeAfter = keyboardEngine?.activeVoices.map((token) => token.midi) ?? []; });
    };
    document.addEventListener("focusin", onFocus);
    window.addEventListener("blur", onBlur);
    for (const type of POINTER_TYPES) document.addEventListener(type, onPointer, true);
    const target = Number(new URLSearchParams(location.search).get("width"));
    let resizeTimer;
    if (window.opener && [375, 1440].includes(target)) {
      window.resizeTo(outerWidth + target - innerWidth, outerHeight);
      resizeTimer = setTimeout(() => window.resizeTo(outerWidth + target - innerWidth, outerHeight), 150);
    }
    return () => {
      console.error = originalError;
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onError);
      document.removeEventListener("focusin", onFocus);
      window.removeEventListener("blur", onBlur);
      for (const type of POINTER_TYPES) document.removeEventListener(type, onPointer, true);
      clearTimeout(resizeTimer);
      for (const timer of sampleTimers) clearTimeout(timer);
    };
  }, []);

  async function scriptedChecks() {
    const results = [];
    const add = (id, pass, actual) => results.push({ id, status: pass ? "PASS" : "FAIL", actual });
    try {
      releaseKeys();
      commits.length = 0; renders.length = 0;
      const notes = [...document.querySelectorAll("button[data-midi]")];
      add("B01-B02", notes.length === 88 && document.querySelectorAll(`.${keyStyles.white}`).length === 52 && document.querySelectorAll(`.${keyStyles.black}`).length === 36,
        { keys: notes.length, white: document.querySelectorAll(`.${keyStyles.white}`).length, black: document.querySelectorAll(`.${keyStyles.black}`).length });
      add("R04-names", notes.every((node) => node.getAttribute("aria-label")?.startsWith("Play ")),
        { first: notes[0]?.getAttribute("aria-label"), last: notes.at(-1)?.getAttribute("aria-label") });
      const before = audioRecords.length;
      const prevented = !keyboard(60, "keydown");
      await wait();
      const engine = keyboardEngine;
      add("B04-Enter", prevented && pressed().includes(60), { pressed: pressed(), prevented });
      const singleCommits = commits.filter((sample) => sample.phase !== "mount");
      add("P01-P02", singleCommits.length > 0 && singleCommits.every((sample) => sample.midi === 60),
        { method: "instrumented memo inner subtree React.Profiler", commits: singleCommits, renderInvocations: [...renders] });
      add("A01", audioRecords.length >= before && audioRecords.at(-1)?.context.state === "running",
        { contextsBeforeGesture: before, contextsNow: audioRecords.length, state: audioRecords.at(-1)?.context.state,
          initialState: audioRecords.at(-1)?.initialState, userGestureActive: audioRecords.at(-1)?.userGestureActive,
          resumeCalls: audioRecords.at(-1)?.resumeCalls });
      const signal = await waitForSignal(audioRecords.at(-1));
      add("A02", signal.rms > 0.00001, { ...signal, method: "real AudioContext AnalyserNode, not human listening" });
      const voiceCount = engine.activeVoices.length;
      keyboard(60, "keydown", "Enter", true);
      await wait();
      add("B04-repeat", engine.activeVoices.length === voiceCount, { count: engine.activeVoices.length });
      keyboard(60, "keyup");
      await wait(160);
      const silence = rms(audioRecords.at(-1));
      add("A03", engine.activeVoices.length === 0 && engine.releasingVoices.length === 0 && silence < 0.00001,
        { active: engine.activeVoices.length, tails: engine.releasingVoices.length, rms: silence, ended: audioRecords.at(-1).ended });
      keyboard(64, "keydown", "Space"); await wait();
      add("B04-Space", pressed().includes(64), { pressed: pressed() });
      keyboard(64, "keyup", "Space"); await wait();
      key(60).focus();
      keyboard(60, "keydown", "ArrowRight");
      const right = document.activeElement?.dataset.midi;
      keyboard(61, "keydown", "Home");
      const home = document.activeElement?.dataset.midi;
      keyboard(21, "keydown", "End");
      const end = document.activeElement?.dataset.midi;
      add("B05", right === "61" && home === "21" && end === "108", { right, home, end });
      for (let count = 0; count < 12; count += 1) { keyboard(60, "keydown"); keyboard(60, "keyup"); }
      await wait(160);
      add("B09", pressed().length === 0 && engine.activeVoices.length === 0, { pressed: pressed(), voices: engine.activeVoices.length });
      for (let midi = 60; midi < 68; midi += 1) keyboard(midi, "keydown");
      await wait();
      add("B10-A05", engine.activeVoices.length === 8 && pressed().length === 8,
        { pressed: pressed(), active: engine.activeVoices.map((token) => token.midi), rms: rms(audioRecords.at(-1)) });
      commits.length = 0; renders.length = 0;
      keyboard(68, "keydown"); await wait();
      const affected = [...new Set(commits.filter((sample) => sample.phase !== "mount").map((sample) => sample.midi))].toSorted((a, b) => a - b);
      add("A06-P03", !pressed().includes(60) && pressed().includes(68) && engine.activeVoices.length === 8 && affected.length === 2 && affected[0] === 60 && affected[1] === 68,
        { pressed: pressed(), committedKeys: affected, renderInvocations: [...renders] });
      releaseKeys(); await wait(160);
      add("R01-R02", document.documentElement.scrollWidth <= innerWidth,
        { viewport: innerWidth, documentWidth: document.documentElement.scrollWidth });
      add("B14", errors.length === 0, { capturedErrors: [...errors] });
    } catch (error) { add("SCRIPT", false, error.message); }
    setReport({ ...metadata(), method: "synthetic DOM events through actual client React handlers; pointer/native focus checks separate", results });
  }

  async function audioChecks() {
    const results = [];
    const engine = createMeasuredSynth();
    try {
      const token = await engine.noteOn(69);
      const record = audioRecords.at(-1);
      const { rms: signal } = await waitForSignal(record);
      engine.stopAll(); await wait(160);
      const silence = rms(record);
      const closed = await engine.dispose();
      results.push({ id: "A04-A07", status: token.ok && signal > 0.00001 && silence < 0.00001 && closed.ok && record.context.state === "closed" ? "PASS" : "FAIL",
        actual: { signalRms: signal, stopRms: silence, closeResult: closed, contextState: record.context.state, oscillators: record.oscillators.length, ended: record.ended } });
    } finally { await engine.dispose(); }
    setReport({ ...metadata(), method: "real-browser standalone engine/analyser", results });
  }

  return <section className="gate">
    <h1>H2-T3 real-browser verification gate</h1>
    <p>Tests use the real client component and native Web Audio. Synthetic event checks are labelled; physical listening is not asserted.</p>
    <nav aria-label="Verification controls">
      <button type="button" onClick={scriptedChecks}>Run client checks</button>
      <button type="button" onClick={audioChecks}>Measure Stop and dispose</button>
      <button type="button" onClick={() => setReport({ ...metadata(), pressed: pressed(), nativeEvents: structuredClone(nativeEvents.slice(-30)),
        lastKeyFocus, audioAlert: document.querySelector('[role="alert"]')?.textContent ?? null,
        keyboardMounted: Boolean(key(60)), errors: [...errors], active: keyboardEngine?.activeVoices,
        contexts: audioRecords.map((record) => ({ state: record.context.state, initialState: record.initialState,
          userGestureActive: record.userGestureActive, resumeCalls: record.resumeCalls, ended: record.ended,
          oscillators: record.oscillators.length })) })}>Capture native evidence</button>
      <button type="button" onClick={async () => { releaseKeys(); keyboard(60, "keydown"); await wait(); setReport({
        ...metadata(), id: "B11-before-blur", pressed: pressed(), active: keyboardEngine?.activeVoices,
      }); }}>Hold C4 for blur check</button>
      <button type="button" onClick={() => setMounted((value) => !value)}>Mount or unmount keyboard</button>
      <button type="button" onClick={async () => {
        // Forces the resume branch: the next real key press must call resume().
        const record = audioRecords.at(-1);
        if (record && record.context.state === "running") await record.context.suspend();
        setReport({ ...metadata(), id: "A01-suspended", contexts: audioRecords.map((item) => ({
          state: item.context.state, resumeCalls: item.resumeCalls })) });
      }}>Suspend latest audio context</button>
      <button type="button" onClick={() => { failStartup = true; setRevision((value) => value + 1); }}>Inject startup failure</button>
      <button type="button" onClick={() => { failStartup = false; setRevision((value) => value + 1); }}>Restore audio</button>
      {[375, 1440].map((width) => <button key={`viewport-${width}`} type="button" onClick={() => window.open(`${location.pathname}?width=${width}`, `piano-gate-${width}`, `popup,width=${width},height=900`)}>Open {width}px window</button>)}
    </nav>
    <label htmlFor={cancelId}>Cancel next real pointer press</label>
    <input id={cancelId} type="checkbox" onChange={(event) => { cancelNext = event.target.checked; }} />
    {mounted && <PianoKeyboard key={`keyboard-${revision}`} createSynth={createKeyboardSynth} />}
    <h2>Actual evidence</h2>
    <pre role="status">{JSON.stringify(report, null, 2)}</pre>
  </section>;
}

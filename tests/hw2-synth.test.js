import assert from "node:assert/strict";
import test from "node:test";
import { PolyphonicSynth, SYNTH_SETTINGS } from "../src/homeworks/GrandPiano88/audio/PolyphonicSynth.js";
import { MockAudioContext, deferred } from "./helpers/mockAudio.js";

function setup(t, configure = () => {}) {
  const context = new MockAudioContext();
  configure(context);
  let creations = 0;
  const engine = new PolyphonicSynth({ createContext: () => { creations += 1; return context; } });
  t.after(() => engine.dispose());
  return { engine, context, creations: () => creations };
}

async function play(engine, midi) {
  const result = await engine.noteOn(midi);
  assert.equal(result.ok, true, result.error);
  return result.voice;
}

const midis = (engine) => engine.activeVoices.map((voice) => voice.midi);
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);

test("T2-01: empty engine owns no context or audio nodes until noteOn", (t) => {
  const { engine, context, creations } = setup(t);
  assert.deepEqual(engine.activeVoices, []);
  assert.deepEqual(engine.releasingVoices, []);
  assert.equal(creations(), 0);
  assert.equal(context.gains.length, 0);
});

test("T2-02: noteOn uses H2-T1 MIDI pitch and resumes a suspended context", async (t) => {
  const { engine, context, creations } = setup(t, (ctx) => { ctx.state = "suspended"; });
  const token = await play(engine, 69);
  assert.equal(token.midi, 69);
  assert.ok(Object.isFrozen(token));
  assert.equal(context.oscillators[0].frequency.valueAt(0), 440);
  assert.equal(context.oscillators[0].started, true);
  assert.equal(context.resumeCalls, 1);
  await play(engine, 21);
  assert.equal(context.oscillators[1].frequency.valueAt(0), 27.5);
  assert.equal(creations(), 1);
  assert.equal(context.resumeCalls, 1);
});

test("T2-03: eight distinct notes can sound simultaneously", async (t) => {
  const { engine, context } = setup(t);
  for (let midi = 60; midi < 68; midi += 1) await play(engine, midi);
  assert.equal(engine.activeVoices.length, 8);
  assert.equal(context.soundingOscillators.length, 8);
  assert.equal(new Set(engine.activeVoices.map((v) => v.id)).size, 8);
});

test("T2-04: ninth note immediately removes oldest logical voice and releases it", async (t) => {
  const { engine, context } = setup(t);
  const first = await play(engine, 60);
  for (let midi = 61; midi <= 68; midi += 1) await play(engine, midi);
  assert.deepEqual(midis(engine), [61, 62, 63, 64, 65, 66, 67, 68]);
  assert.deepEqual(engine.releasingVoices, [first]);
  assert.equal(engine.noteOff(first), false);
  context.advanceTo(0.04);
  assert.equal(engine.releasingVoices.length, 0);
  assert.equal(context.oscillators[0].connections.size, 0);
});

test("T2-05: FIFO remains correct after release and insertion", async (t) => {
  const { engine } = setup(t);
  const tokens = [];
  for (let midi = 60; midi < 68; midi += 1) tokens.push(await play(engine, midi));
  engine.noteOff(tokens[2]);
  await play(engine, 80);
  assert.deepEqual(midis(engine), [60, 61, 63, 64, 65, 66, 67, 80]);
  await play(engine, 81);
  assert.deepEqual(midis(engine), [61, 63, 64, 65, 66, 67, 80, 81]);
});

test("T2-06: noteOff releases exactly its token while other notes keep sounding", async (t) => {
  const { engine, context } = setup(t);
  const first = await play(engine, 60);
  const second = await play(engine, 64);
  assert.equal(engine.noteOff(first), true);
  assert.deepEqual(engine.activeVoices, [second]);
  context.advanceTo(0.04);
  assert.equal(context.oscillators[0].ended, true);
  assert.equal(context.oscillators[1].ended, false);
});

test("T2-07: duplicate or invalid noteOff is harmless", async (t) => {
  const { engine, context } = setup(t);
  const token = await play(engine, 60);
  assert.equal(engine.noteOff(token), true);
  for (const invalid of [token, null, undefined, 60, { ...token }]) {
    assert.equal(engine.noteOff(invalid), false);
  }
  assert.equal(context.oscillators[0].stopCalls.length, 1);
});

test("T2-08: same-MIDI retrigger creates a fresh FIFO token; old releases are stale", async (t) => {
  const { engine, context } = setup(t);
  const old = await play(engine, 60);
  const other = await play(engine, 64);
  const replacement = await play(engine, 60);
  assert.notEqual(old.id, replacement.id);
  assert.deepEqual(engine.activeVoices, [other, replacement]);
  assert.deepEqual(engine.releasingVoices, [old]);
  assert.equal(engine.noteOff(old), false);
  context.advanceTo(0.04);
  assert.deepEqual(engine.activeVoices, [other, replacement]);
  assert.equal(engine.noteOff(replacement), true);
});

test("T2-09: attack/decay/sustain and 40ms release match audible gain targets", async (t) => {
  const { engine, context } = setup(t);
  const token = await play(engine, 69);
  const gain = context.gains[1].gain;
  near(gain.valueAt(0), 0.0001);
  near(gain.valueAt(0.005), 1);
  near(gain.valueAt(0.045), 0.825);
  near(gain.valueAt(0.085), 0.65);
  context.advanceTo(0.1);
  engine.noteOff(token);
  near(gain.valueAt(0.1), 0.65);
  near(gain.valueAt(0.14), 0.0001);
  assert.equal(gain.events.at(-1).type, "exponential");
  near(context.oscillators[0].stopTime, 0.14);
});

test("T2-10: ended voices disconnect both nodes and remove end callback", async (t) => {
  const { engine, context } = setup(t);
  engine.noteOff(await play(engine, 60));
  context.advanceTo(0.05);
  assert.deepEqual(engine.releasingVoices, []);
  assert.equal(context.oscillators[0].connections.size, 0);
  assert.equal(context.gains[1].connections.size, 0);
  assert.equal(context.oscillators[0].onended, null);
});

test("T2-11: dispose immediately silences active voices and release tails and closes context", async (t) => {
  const { engine, context } = setup(t);
  engine.noteOff(await play(engine, 60));
  await play(engine, 64);
  const disposing = engine.dispose();
  assert.deepEqual(engine.activeVoices, []);
  assert.deepEqual(engine.releasingVoices, []);
  assert.equal(context.soundingOscillators.length, 0);
  assert.equal(context.gains[0].gain.valueAt(0), 0);
  assert.ok(context.gains.every((gain) => gain.connections.size === 0));
  assert.equal((await disposing).ok, true);
  assert.equal(context.state, "closed");
  assert.ok(context.oscillators.every((oscillator) => oscillator.ended));
  assert.equal((await engine.noteOn(69)).ok, false);
});

test("T2-12: repeated/concurrent disposal is safe and does not recreate resources", async (t) => {
  const { engine, context, creations } = setup(t);
  await play(engine, 69);
  const first = engine.dispose();
  assert.equal(engine.dispose(), first);
  assert.equal((await first).ok, true);
  assert.equal((await engine.dispose()).ok, true);
  assert.equal(context.closeCalls, 1);
  assert.equal(creations(), 1);
});

test("T2-13: resume rejection resolves a failure result without starting oscillators, then can retry", async (t) => {
  const { engine, context } = setup(t, (ctx) => {
    ctx.state = "suspended";
    ctx.resumeImpl = () => Promise.reject(new Error("User gesture required"));
  });
  const result = await engine.noteOn(69);
  assert.deepEqual(result, { ok: false, error: "User gesture required" });
  assert.equal(context.oscillators.length, 0);
  assert.equal(engine.lastError, result.error);
  context.resumeImpl = null;
  await play(engine, 69);
  assert.equal(engine.lastError, null);
  assert.equal(context.resumeCalls, 2);
});

test("T2-14: stolen token and old ended callback cannot terminate a newer same-MIDI voice", async (t) => {
  const { engine, context } = setup(t);
  const old = await play(engine, 60);
  const oldEnded = context.oscillators[0].onended;
  for (let midi = 61; midi <= 68; midi += 1) await play(engine, midi);
  const fresh = await play(engine, 60);
  assert.equal(engine.noteOff(old), false);
  oldEnded();
  oldEnded();
  assert.ok(engine.activeVoices.includes(fresh));
  assert.equal(engine.noteOff(fresh), true);
});

test("T2-15: sustained overload never exceeds eight logical voices or the bounded tail budget", async (t) => {
  const { engine, context } = setup(t);
  for (let count = 0; count < 100; count += 1) {
    await play(engine, 21 + count % 88);
    assert.ok(engine.activeVoices.length <= 8);
    assert.ok(engine.releasingVoices.length <= 8);
    assert.ok(context.soundingOscillators.length <= 16);
    // Unit sine sources have peak <= 1, all envelope targets <= 1.
    const peakBound = context.soundingOscillators.length * context.gains[0].gain.valueAt(0);
    assert.ok(peakBound <= 0.8);
  }
  engine.stopAll();
  assert.equal(context.soundingOscillators.length, 0);
  assert.deepEqual(engine.activeVoices, []);
  assert.deepEqual(engine.releasingVoices, []);
});

test("release during attack or decay anchors the current level without a gain jump", async (t) => {
  for (const [time, expected] of [[0.0025, 0.50005], [0.045, 0.825]]) {
    const { engine, context } = setup(t);
    const token = await play(engine, 69);
    context.advanceTo(time);
    engine.noteOff(token);
    near(context.gains[1].gain.valueAt(time), expected);
    near(context.gains[1].gain.valueAt(time + 0.04), 0.0001);
    assert.equal(engine.releasingVoices.length, 1);
  }
});

test("dispose during a pending resume cannot create a late voice", async (t) => {
  const pending = deferred();
  const { engine, context } = setup(t, (ctx) => {
    ctx.state = "suspended";
    ctx.resumeImpl = () => pending.promise;
  });
  const starting = engine.noteOn(69);
  assert.equal(context.resumeCalls, 1);
  await engine.dispose();
  pending.resolve();
  assert.equal((await starting).ok, false);
  assert.equal(context.oscillators.length, 0);
  assert.equal(context.state, "closed");
});

test("stopAll invalidates pending startup; later calls can play after shared resume", async (t) => {
  const pending = deferred();
  const { engine, context } = setup(t, (ctx) => {
    ctx.state = "suspended";
    ctx.resumeImpl = () => pending.promise;
  });
  const cancelled = engine.noteOn(60);
  engine.stopAll();
  const newer = engine.noteOn(64);
  pending.resolve();
  assert.equal((await cancelled).ok, false);
  assert.equal((await newer).ok, true);
  assert.deepEqual(midis(engine), [64]);
  assert.equal(context.resumeCalls, 1);
});

test("concurrent noteOn calls share resume and retain FIFO admission order", async (t) => {
  const pending = deferred();
  const { engine, context } = setup(t, (ctx) => {
    ctx.state = "suspended";
    ctx.resumeImpl = () => pending.promise;
  });
  const results = [60, 64, 67].map((midi) => engine.noteOn(midi));
  pending.resolve();
  assert.ok((await Promise.all(results)).every((result) => result.ok));
  assert.deepEqual(midis(engine), [60, 64, 67]);
  assert.equal(context.resumeCalls, 1);
});

test("initialization failure and invalid MIDI report errors without rejected noteOn promises", async () => {
  const engine = new PolyphonicSynth({ createContext: () => { throw new Error("Audio unavailable"); } });
  assert.deepEqual(await engine.noteOn(69), { ok: false, error: "Audio unavailable" });
  assert.equal((await engine.noteOn(109)).ok, false);
  assert.equal((await engine.dispose()).ok, true);
});

test("partial voice allocation failure disconnects the oscillator and can recover", async (t) => {
  const { engine, context } = setup(t, (ctx) => { ctx.failVoiceGain = true; });
  assert.equal((await engine.noteOn(69)).ok, false);
  assert.equal(context.oscillators[0].started, false);
  assert.equal(context.oscillators[0].connections.size, 0);
  assert.equal(context.oscillators[0].onended, null);
  assert.deepEqual(engine.activeVoices, []);
  context.failVoiceGain = false;
  await play(engine, 69);
});

test("context close rejection is handled and dispose can retry while output stays disconnected", async (t) => {
  const { engine, context } = setup(t, (ctx) => {
    ctx.closeImpl = () => Promise.reject(new Error("Close failed"));
  });
  await play(engine, 69);
  assert.deepEqual(await engine.dispose(), { ok: false, error: "Close failed" });
  assert.equal(context.soundingOscillators.length, 0);
  assert.ok(context.gains.every((gain) => gain.connections.size === 0));
  context.closeImpl = null;
  assert.equal((await engine.dispose()).ok, true);
  assert.equal(context.state, "closed");
});

test("foreign-engine tokens cannot release a voice even if their textual IDs coincide", async (t) => {
  const first = setup(t);
  const second = setup(t);
  const foreign = await play(first.engine, 69);
  const own = await play(second.engine, 69);
  assert.equal(second.engine.noteOff(foreign), false);
  assert.deepEqual(second.engine.activeVoices, [own]);
  assert.ok(Object.isFrozen(second.engine.activeVoices));
  assert.equal(SYNTH_SETTINGS.releaseSeconds, 0.04);
});

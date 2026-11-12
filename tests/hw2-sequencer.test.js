import assert from "node:assert/strict";
import test from "node:test";
import { playSequence, scheduleReplay, REPLAY_SPEEDS } from "../src/homeworks/GrandPiano88/sequencePlayer.js";
import { createRecordedNoteEvent } from "../src/homeworks/GrandPiano88/contracts.js";
import { midiToFrequency } from "../src/homeworks/GrandPiano88/notes.js";
import { createPianoInput } from "../src/homeworks/GrandPiano88/pianoInput.js";
import { PolyphonicSynth } from "../src/homeworks/GrandPiano88/audio/PolyphonicSynth.js";
import { MockAudioContext } from "./helpers/mockAudio.js";

const note = (midi, deltaMs, durationMs) => createRecordedNoteEvent({ midi, freqHz: midiToFrequency(midi), deltaMs, durationMs });
// C-E chord, then G after a rest; E released before C.
const PHRASE = [note(60, 100, 300), note(64, 0, 200), note(67, 800, 100)];

/** Deterministic virtual clock implementing setTimer/clearTimer/now. */
function virtualClock() {
  let time = 0;
  let id = 0;
  const timers = new Map();
  return {
    now: () => time,
    setTimer(callback, ms) { id += 1; timers.set(id, { at: time + ms, callback }); return id; },
    clearTimer(timer) { timers.delete(timer); },
    pending: () => timers.size,
    async advance(ms) {
      const end = time + ms;
      for (;;) {
        const next = [...timers.entries()].toSorted((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
        if (!next || next[1].at > end) break;
        timers.delete(next[0]);
        time = next[1].at;
        next[1].callback();
        await Promise.resolve();
      }
      time = end;
      await Promise.resolve();
    },
  };
}

function recorderOf(clock) {
  const log = [];
  return {
    log,
    press: (owner, midi) => { log.push(["on", midi, clock.now(), owner]); return Promise.resolve(); },
    release: (owner) => { log.push(["off", owner, clock.now()]); },
  };
}

test("schedule scales onsets and durations at every speed and keeps overlap", () => {
  assert.deepEqual(REPLAY_SPEEDS, [0.5, 1, 2]);
  const at = (speed) => scheduleReplay(PHRASE, speed).map(({ midi, onsetMs, releaseMs }) => [midi, onsetMs, releaseMs]);
  assert.deepEqual(at(1), [[60, 100, 400], [64, 100, 300], [67, 900, 1000]]);
  assert.deepEqual(at(2), [[60, 50, 200], [64, 50, 150], [67, 450, 500]]);
  assert.deepEqual(at(0.5), [[60, 200, 800], [64, 200, 600], [67, 1800, 2000]]);
  assert.throws(() => scheduleReplay(PHRASE, 3), RangeError);
  assert.throws(() => scheduleReplay([{ midi: 60 }], 1), TypeError);
});

for (const speed of REPLAY_SPEEDS) {
  test(`replay at ${speed}x presses and releases at scheduled times then completes`, async () => {
    const clock = virtualClock();
    const io = recorderOf(clock);
    const done = playSequence({ events: PHRASE, speed, ...io, ...clock });
    await clock.advance(5000);
    assert.deepEqual(await done, { status: "completed", played: 3 });
    const onsets = io.log.filter((entry) => entry[0] === "on").map((entry) => [entry[1], entry[2]]);
    const expected = scheduleReplay(PHRASE, speed).map((item) => [item.midi, item.onsetMs]);
    assert.deepEqual(onsets, expected);
    assert.equal(io.log.filter((entry) => entry[0] === "off").length, 3);
    assert.equal(clock.pending(), 0);
  });
}

test("abort during a chord clears timers, releases only this run's held notes and resolves aborted", async () => {
  const clock = virtualClock();
  const io = recorderOf(clock);
  const controller = new AbortController();
  const done = playSequence({ events: PHRASE, speed: 1, signal: controller.signal, ...io, ...clock });
  await clock.advance(150);
  controller.abort();
  assert.deepEqual(await done, { status: "aborted", played: 2 });
  assert.equal(clock.pending(), 0);
  const offs = io.log.filter((entry) => entry[0] === "off").map((entry) => entry[1]).toSorted();
  const ons = io.log.filter((entry) => entry[0] === "on").map((entry) => entry[3]).toSorted();
  assert.deepEqual(offs, ons);
  await clock.advance(5000);
  assert.equal(io.log.filter((entry) => entry[0] === "on").length, 2);
});

test("already-aborted signal, repeated abort and empty sequences settle without work", async () => {
  const clock = virtualClock();
  const io = recorderOf(clock);
  const controller = new AbortController();
  controller.abort();
  assert.deepEqual(await playSequence({ events: PHRASE, speed: 1, signal: controller.signal, ...io, ...clock }), { status: "aborted", played: 0 });
  assert.deepEqual(await playSequence({ events: [], speed: 2, ...io, ...clock }), { status: "completed", played: 0 });
  const second = new AbortController();
  const done = playSequence({ events: PHRASE, speed: 1, signal: second.signal, ...io, ...clock });
  second.abort(); second.abort();
  assert.equal((await done).status, "aborted");
  assert.equal(io.log.length, 0);
});

test("timers are anchored to replay start, so a late timer does not delay later notes", async () => {
  const clock = virtualClock();
  const io = recorderOf(clock);
  const late = { ...clock, setTimer: (callback, ms) => clock.setTimer(callback, ms + (ms > 0 ? 40 : 0)) };
  const done = playSequence({ events: [note(60, 100, 10), note(62, 100, 10), note(64, 100, 10)], speed: 1, ...io, ...late });
  await clock.advance(1000);
  await done;
  const onsets = io.log.filter((entry) => entry[0] === "on").map((entry) => entry[2]);
  // Each onset is late by at most one timer's lag (40ms), not cumulatively.
  assert.deepEqual(onsets, [140, 240, 340]);
});

test("Play-Stop-Play: an old run cannot release a note owned by the new run", async (t) => {
  const context = new MockAudioContext();
  const input = createPianoInput({ createSynth: () => new PolyphonicSynth({ createContext: () => context }) });
  t.after(() => input.detach());
  const clock = virtualClock();
  const first = new AbortController();
  const one = playSequence({ events: [note(60, 0, 1000)], speed: 1, signal: first.signal, press: input.press, release: input.release, ...clock });
  await clock.advance(10);
  first.abort();
  await one;
  const two = playSequence({ events: [note(60, 0, 1000)], speed: 1, press: input.press, release: input.release, ...clock });
  await clock.advance(10);
  await Promise.resolve();
  assert.deepEqual(input.getSnapshot().pressedMidis, [60]);
  await clock.advance(2000);
  assert.equal((await two).status, "completed");
  assert.deepEqual(input.getSnapshot().pressedMidis, []);
});

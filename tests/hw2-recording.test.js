import assert from "node:assert/strict";
import test from "node:test";
import { createRecorder } from "../src/homeworks/GrandPiano88/recording.js";
import { assertRecordedNoteEvent } from "../src/homeworks/GrandPiano88/contracts.js";
import { createPianoInput } from "../src/homeworks/GrandPiano88/pianoInput.js";
import { PolyphonicSynth } from "../src/homeworks/GrandPiano88/audio/PolyphonicSynth.js";
import { MockAudioContext } from "./helpers/mockAudio.js";

function clockRecorder(options = {}) {
  const clock = { ms: 1000 };
  const recorder = createRecorder({ now: () => clock.ms, ...options });
  return { clock, recorder };
}
const events = (recorder) => recorder.getSnapshot().entries.map((entry) => entry.event);

test("chord, rest and overlapping release order produce onset-ordered deltas and durations", () => {
  const { clock, recorder } = clockRecorder();
  recorder.start([]);
  clock.ms = 1100; recorder.observe([60, 64]);          // chord onset
  clock.ms = 1300; recorder.observe([60]);              // 64 releases first
  clock.ms = 1400; recorder.observe([]);
  clock.ms = 1900; recorder.observe([67]);              // after a rest
  clock.ms = 2000; recorder.observe([]);
  clock.ms = 2100; recorder.stop();
  assert.deepEqual(events(recorder), [
    { midi: 60, freqHz: 2 ** ((60 - 69) / 12) * 440, durationMs: 300, deltaMs: 100 },
    { midi: 64, freqHz: 2 ** ((64 - 69) / 12) * 440, durationMs: 200, deltaMs: 0 },
    { midi: 67, freqHz: 2 ** ((67 - 69) / 12) * 440, durationMs: 100, deltaMs: 800 },
  ]);
  for (const event of events(recorder)) assert.doesNotThrow(() => assertRecordedNoteEvent(event));
});

test("stop finalizes held notes and publishes only completed frozen entries", () => {
  const { clock, recorder } = clockRecorder();
  recorder.start([]);
  clock.ms = 1050; recorder.observe([72]);
  assert.deepEqual(recorder.getSnapshot().entries, []);
  assert.equal(recorder.getSnapshot().capturedCount, 1);
  clock.ms = 1250; recorder.stop();
  const snapshot = recorder.getSnapshot();
  assert.equal(snapshot.status, "idle");
  assert.equal(snapshot.entries[0].event.durationMs, 200);
  assert.ok(Object.isFrozen(snapshot) && Object.isFrozen(snapshot.entries) && Object.isFrozen(snapshot.entries[0]));
  assert.throws(() => { snapshot.entries[0].event.durationMs = 1; }, TypeError);
});

test("notes held before start are ignored; new takes get new stable IDs and old snapshots stay unchanged", () => {
  const { clock, recorder } = clockRecorder();
  recorder.observe([60]);
  recorder.start();
  clock.ms = 1100; recorder.observe([]);
  clock.ms = 1200; recorder.observe([62]);
  clock.ms = 1300; recorder.stop();
  const first = recorder.getSnapshot();
  assert.deepEqual(first.entries.map((entry) => entry.event.midi), [62]);
  recorder.start([]);
  clock.ms = 1400; recorder.observe([64]);
  recorder.stop();
  assert.equal(first.entries[0].id, "take-1-note-0");
  assert.equal(recorder.getSnapshot().entries[0].id, "take-2-note-0");
  assert.deepEqual(first.entries.map((entry) => entry.event.midi), [62]);
});

test("repeated MIDI after release is a new event; empty and zero-length takes are valid", () => {
  const { clock, recorder } = clockRecorder();
  recorder.start([]);
  recorder.stop();
  assert.deepEqual(recorder.getSnapshot().entries, []);
  recorder.start([]);
  recorder.observe([60]); recorder.observe([]); recorder.observe([60]);
  clock.ms = 1010; recorder.observe([]);
  recorder.stop();
  assert.deepEqual(events(recorder).map((event) => [event.durationMs, event.deltaMs]), [[0, 0], [10, 0]]);
});

test("recording stops itself at the note limit and reports it", () => {
  const { recorder } = clockRecorder({ maxNotes: 3 });
  recorder.start([]);
  recorder.observe([60]); recorder.observe([60, 62]); recorder.observe([60, 62, 64]); recorder.observe([60, 62, 64, 65]);
  const snapshot = recorder.getSnapshot();
  assert.equal(snapshot.status, "idle");
  assert.equal(snapshot.limitReached, true);
  assert.deepEqual(snapshot.entries.map((entry) => entry.event.midi), [60, 62, 64]);
});

test("observing without recording publishes nothing; clear is ignored while recording", () => {
  const { recorder } = clockRecorder();
  let updates = 0;
  recorder.subscribe(() => { updates += 1; });
  recorder.observe([60]); recorder.observe([]);
  assert.equal(updates, 0);
  recorder.start([]);
  recorder.clear();
  assert.equal(recorder.getSnapshot().status, "recording");
  recorder.stop();
  recorder.clear();
  assert.deepEqual(recorder.getSnapshot().entries, []);
});

test("integration: a FIFO-stolen note ends when it stops sounding", async (t) => {
  const context = new MockAudioContext();
  const input = createPianoInput({ createSynth: () => new PolyphonicSynth({ createContext: () => context }) });
  t.after(() => input.detach());
  const clock = { ms: 0 };
  const recorder = createRecorder({ now: () => clock.ms });
  input.subscribe(() => recorder.observe(input.getSnapshot().pressedMidis));
  recorder.start([]);
  for (let midi = 60; midi <= 67; midi += 1) { clock.ms += 10; await input.press(`p:${midi}`, midi); }
  clock.ms = 500; await input.press("p:68", 68);    // steals 60
  clock.ms = 900; recorder.stop();
  const byMidi = Object.fromEntries(events(recorder).map((event) => [event.midi, event]));
  assert.equal(byMidi[60].durationMs, 490);
  assert.equal(byMidi[68].durationMs, 400);
  assert.equal(events(recorder).length, 9);
});

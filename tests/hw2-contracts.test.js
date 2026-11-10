import assert from "node:assert/strict";
import test from "node:test";
import {
  assertRecordedNoteEvent, createRecordedNoteEvent, orderNoteOnsets,
} from "../src/homeworks/GrandPiano88/contracts.js";

const validEvent = () => ({ midi: 69, freqHz: 440, durationMs: 100, deltaMs: 25 });

test("recorded events retain exactly the required serializable fields", () => {
  const input = validEvent();
  const event = createRecordedNoteEvent(input);
  assert.deepEqual(event, input);
  assert.notEqual(event, input);
  assert.equal(Object.isFrozen(input), false);
  assert.ok(Object.isFrozen(event));
  assert.doesNotThrow(() => assertRecordedNoteEvent(JSON.parse(JSON.stringify(event))));
  assert.deepEqual(JSON.parse(JSON.stringify(event)), event);
  input.durationMs = 900;
  assert.equal(event.durationMs, 100);
  assert.throws(() => { event.deltaMs = 5; }, TypeError);
});

test("zero durations and simultaneous onset deltas are valid", () => {
  assert.doesNotThrow(() => createRecordedNoteEvent({
    midi: 21, freqHz: 27.5, durationMs: 0, deltaMs: 0,
  }));
});

test("event schema rejects missing/extra fields and non-record objects", () => {
  for (const value of [null, undefined, [], new Date(), "event", 12]) {
    assert.throws(() => assertRecordedNoteEvent(value), TypeError);
  }
  for (const field of Object.keys(validEvent())) {
    const missing = validEvent();
    delete missing[field];
    assert.throws(() => assertRecordedNoteEvent(missing), TypeError);
  }
  assert.throws(() => assertRecordedNoteEvent({ ...validEvent(), callback: () => {} }), TypeError);
  assert.throws(() => assertRecordedNoteEvent({ ...validEvent(), [Symbol("extra")]: 1 }), TypeError);
});

test("event validation rejects invalid MIDI and mismatched or invalid frequency", () => {
  for (const midi of [20, 109, 69.5, NaN, Infinity, "69", null]) {
    assert.throws(() => createRecordedNoteEvent({ ...validEvent(), midi }), RangeError);
  }
  for (const freqHz of [0, -440, NaN, Infinity, "440", null, 441]) {
    assert.throws(() => createRecordedNoteEvent({ ...validEvent(), freqHz }), RangeError);
  }
  assert.doesNotThrow(() => createRecordedNoteEvent({ ...validEvent(), freqHz: 440.0000001 }));
});

test("duration and delta reject negatives, non-finite numbers and coercible values", () => {
  for (const field of ["durationMs", "deltaMs"]) {
    for (const value of [-1, NaN, Infinity, -Infinity, "100", null, undefined]) {
      assert.throws(() => createRecordedNoteEvent({ ...validEvent(), [field]: value }), RangeError);
    }
  }
});

test("onsets sort by monotonic time then admission order without mutating input", () => {
  // Arrival can be release order: the later, shorter note finishes first.
  const input = [
    { midi: 72, noteOnMs: 1150, onsetOrder: 2 },
    { midi: 67, noteOnMs: 1100, onsetOrder: 1 },
    { midi: 60, noteOnMs: 1100, onsetOrder: 0 },
  ];
  const before = structuredClone(input);
  const ordered = orderNoteOnsets(input, 1000);
  assert.deepEqual(ordered.map((onset) => onset.midi), [60, 67, 72]);
  assert.deepEqual(orderNoteOnsets(input.toReversed(), 1000), ordered);
  assert.deepEqual(input, before);
  assert.ok(Object.isFrozen(ordered));
  assert.ok(ordered.every(Object.isFrozen));
  input[2].noteOnMs = 9999;
  assert.equal(ordered[0].noteOnMs, 1100);
});

test("approved delta semantics preserve initial silence, chord timing and overlap", () => {
  const ordered = orderNoteOnsets([
    { midi: 60, noteOnMs: 1100, onsetOrder: 0 },
    { midi: 64, noteOnMs: 1100, onsetOrder: 1 },
    { midi: 67, noteOnMs: 1150, onsetOrder: 2 },
  ], 1000);
  // Contract fixture, not a recorder: note 1 remains held until Stop at 1400.
  const events = [
    createRecordedNoteEvent({ midi: 60, freqHz: 261.6255653005986, durationMs: 300, deltaMs: 100 }),
    createRecordedNoteEvent({ midi: 64, freqHz: 329.6275569128699, durationMs: 40, deltaMs: 0 }),
    createRecordedNoteEvent({ midi: 67, freqHz: 391.99543598174927, durationMs: 100, deltaMs: 50 }),
  ];
  let previousOnset = 1000;
  for (const [position, event] of events.entries()) {
    assert.equal(event.midi, ordered[position].midi);
    assert.equal(event.deltaMs, ordered[position].noteOnMs - previousOnset);
    previousOnset = ordered[position].noteOnMs;
  }
  assert.equal(ordered[0].noteOnMs + events[0].durationMs, 1400);
  assert.ok(events[0].durationMs > events[2].deltaMs);
});

test("onset ordering rejects invalid clocks, duplicate ordinals and malformed input", () => {
  const onset = { midi: 69, noteOnMs: 100, onsetOrder: 0 };
  for (const start of [-1, NaN, Infinity, "0", undefined]) {
    assert.throws(() => orderNoteOnsets([onset], start), RangeError);
  }
  assert.throws(() => orderNoteOnsets(null, 0), TypeError);
  assert.throws(() => orderNoteOnsets([null], 0), TypeError);
  assert.throws(() => orderNoteOnsets(new Array(1), 0), TypeError);
  assert.throws(() => orderNoteOnsets([onset], 101), RangeError);
  for (const noteOnMs of [-1, NaN, Infinity, "100"]) {
    assert.throws(() => orderNoteOnsets([{ ...onset, noteOnMs }], 0), RangeError);
  }
  for (const onsetOrder of [-1, 0.5, NaN, Infinity, "0", Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => orderNoteOnsets([{ ...onset, onsetOrder }], 0), RangeError);
  }
  assert.throws(() => orderNoteOnsets([onset, { ...onset, midi: 72 }], 0), RangeError);
  assert.throws(() => orderNoteOnsets([{ ...onset, midi: 109 }], 0), RangeError);
  assert.deepEqual(orderNoteOnsets([], 0), []);
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  MIN_PIANO_MIDI, MAX_PIANO_MIDI, PIANO_NOTES,
  generatePianoNotes, midiToFrequency,
} from "../src/homeworks/GrandPiano88/notes.js";

test("piano covers every integer MIDI from A0 to C8 exactly once", () => {
  assert.equal(MIN_PIANO_MIDI, 21);
  assert.equal(MAX_PIANO_MIDI, 108);
  assert.equal(PIANO_NOTES.length, 88);
  assert.equal(new Set(PIANO_NOTES.map((note) => note.midi)).size, 88);
  assert.equal(PIANO_NOTES[0].midi, 21);
  assert.equal(PIANO_NOTES.at(-1).midi, 108);
  for (const [position, note] of PIANO_NOTES.entries()) {
    assert.equal(note.midi, 21 + position);
  }
});

test("piano has 52 white and 36 black keys in the correct pitch classes", () => {
  assert.equal(PIANO_NOTES.filter((note) => note.isBlack).length, 36);
  assert.equal(PIANO_NOTES.filter((note) => !note.isBlack).length, 52);
  const blackPitchClasses = new Set([1, 3, 6, 8, 10]);
  for (const note of PIANO_NOTES) {
    assert.equal(note.isBlack, blackPitchClasses.has(note.midi % 12));
  }
  assert.equal(PIANO_NOTES.find((note) => note.midi === 22).noteName, "A#0");
  assert.equal(PIANO_NOTES.find((note) => note.midi === 24).noteName, "C1");
  assert.equal(PIANO_NOTES.find((note) => note.midi === 60).noteName, "C4");
});

test("A0, A4 and C8 have independently known names and reference frequencies", () => {
  for (const [midi, name, hz] of [
    [21, "A0", 27.5], [69, "A4", 440], [108, "C8", 4186.009044809578],
  ]) {
    const note = PIANO_NOTES.find((entry) => entry.midi === midi);
    assert.equal(note.noteName, name);
    assert.ok(Math.abs(note.freqHz - hz) < 1e-9);
  }
  for (const note of PIANO_NOTES) {
    assert.equal(note.freqHz, 440 * 2 ** ((note.midi - 69) / 12));
    if (note.midi <= 96) {
      assert.ok(Math.abs(midiToFrequency(note.midi + 12) / note.freqHz - 2) < 1e-12);
    }
  }
});

test("fresh generations preserve unique MIDI-based IDs and immutable snapshots", () => {
  const fresh = generatePianoNotes();
  assert.notEqual(fresh, PIANO_NOTES);
  assert.deepEqual(fresh, PIANO_NOTES);
  assert.equal(new Set(fresh.map((note) => note.id)).size, 88);
  assert.ok(Object.isFrozen(fresh));
  for (const note of fresh) {
    assert.equal(note.id, `piano-midi-${note.midi}`);
    assert.ok(Object.isFrozen(note));
  }
  assert.throws(() => { fresh[0].midi = 69; }, TypeError);
  assert.throws(() => fresh.pop(), TypeError);
});

test("frequency conversion rejects out-of-range, fractional and non-numeric MIDI", () => {
  for (const midi of [20, 109, -1, 0, 60.5, NaN, Infinity, -Infinity, "69", null, undefined]) {
    assert.throws(() => midiToFrequency(midi), RangeError);
  }
});

export const MIN_PIANO_MIDI = 21;
export const MAX_PIANO_MIDI = 108;

const PITCH_NAMES = Object.freeze([
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
]);

/** @typedef {Readonly<{id: string, midi: number, noteName: string, isBlack: boolean, freqHz: number}>} PianoNote */

/** Reject coercion, fractional notes and notes outside the 88-key piano. */
export function assertPianoMidi(midi) {
  if (!Number.isInteger(midi) || midi < MIN_PIANO_MIDI || midi > MAX_PIANO_MIDI) {
    throw new RangeError("midi must be an integer from 21 through 108.");
  }
}

export function midiToFrequency(midi) {
  assertPianoMidi(midi);
  return 440 * 2 ** ((midi - 69) / 12);
}

/** @returns {ReadonlyArray<PianoNote>} A fresh frozen snapshot with stable entity IDs. */
export function generatePianoNotes() {
  return Object.freeze(Array.from(
    { length: MAX_PIANO_MIDI - MIN_PIANO_MIDI + 1 },
    (_, offset) => {
      const midi = MIN_PIANO_MIDI + offset;
      const pitchName = PITCH_NAMES[midi % 12];
      return Object.freeze({
        id: `piano-midi-${midi}`,
        midi,
        noteName: `${pitchName}${Math.floor(midi / 12) - 1}`,
        isBlack: pitchName.includes("#"),
        freqHz: midiToFrequency(midi),
      });
    },
  ));
}

export const PIANO_NOTES = generatePianoNotes();

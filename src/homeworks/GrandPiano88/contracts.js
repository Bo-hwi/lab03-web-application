import { assertPianoMidi, midiToFrequency } from "./notes.js";

/**
 * Completed, JSON-serializable event. Array order is FIFO NOTE-ON order,
 * never note-off order. Zero duration and delta are valid (including chords).
 * freqHz must match the equal-tempered MIDI pitch within 1e-9 relative tolerance.
 *
 * @typedef {Readonly<{midi: number, freqHz: number, durationMs: number, deltaMs: number}>} RecordedNoteEvent
 */

/**
 * Internal onset metadata, separate from the four-field serialized event.
 * Capture noteOnMs with performance.now(); assign a unique, monotonically
 * increasing onsetOrder at note-on admission, not at release. Equal timestamp
 * order is resolved by onsetOrder regardless of note-off or array arrival order.
 *
 * @typedef {Readonly<{midi: number, noteOnMs: number, onsetOrder: number}>} NoteOnset
 */

/**
 * RECORDING TIMELINE CONTRACT (engine deferred to H2-T4):
 * - recordingStartMs, noteOnMs, noteOffMs and stopMs use performance.now()
 *   from the SAME time origin. Do not mix Date.now() or AudioContext seconds.
 * - First deltaMs = first noteOnMs - recordingStartMs. Later deltaMs =
 *   current noteOnMs - previous noteOnMs, in ordered onset order.
 * - durationMs = noteOffMs - noteOnMs, independent of the next note's onset.
 *   Overlap is allowed; never add the preceding duration to a replay onset.
 * - On recording Stop, finalize each still-held note using stopMs as noteOffMs.
 *   No incomplete event is published; equal-timestamp notes retain admission order.
 * - Publish new frozen event/array snapshots. Do not mutate published events
 *   while completing other held notes. Persist only finite plain JSON data.
 * - Replay accumulates deltaMs / speed for onsets and uses durationMs / speed
 *   for independent releases. No recording, replay, clock or audio engine here.
 * - Repeated MIDI/input ownership, voice-steal duration semantics, transport
 *   interaction and memory limits remain decisions for T2/T4/T5, not implemented.
 */

const EVENT_FIELDS = Object.freeze(["midi", "freqHz", "durationMs", "deltaMs"]);

function assertNonNegativeFinite(value, name) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a finite non-negative number.`);
  }
}

/** Validate the four-field serialized boundary; extra fields are rejected. */
export function assertRecordedNoteEvent(event) {
  if (event === null || typeof event !== "object" || Array.isArray(event)) {
    throw new TypeError("Recorded note event must be a plain object.");
  }
  const prototype = Object.getPrototypeOf(event);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError("Recorded note event must be a plain object.");
  }
  const fields = Reflect.ownKeys(event);
  if (fields.length !== EVENT_FIELDS.length || fields.some((key) => !EVENT_FIELDS.includes(key))) {
    throw new TypeError("Recorded note event requires only midi, freqHz, durationMs and deltaMs.");
  }
  assertPianoMidi(event.midi);
  const expectedFrequency = midiToFrequency(event.midi);
  if (!Number.isFinite(event.freqHz) || event.freqHz <= 0 ||
      Math.abs(event.freqHz - expectedFrequency) > expectedFrequency * 1e-9) {
    throw new RangeError("freqHz must match the MIDI pitch.");
  }
  assertNonNegativeFinite(event.durationMs, "durationMs");
  assertNonNegativeFinite(event.deltaMs, "deltaMs");
}

/** @returns {RecordedNoteEvent} Frozen copy; the caller's object is never frozen or retained. */
export function createRecordedNoteEvent(event) {
  assertRecordedNoteEvent(event);
  const { midi, freqHz, durationMs, deltaMs } = event;
  return Object.freeze({ midi, freqHz, durationMs, deltaMs });
}

/**
 * Pure ordering/validation helper, not a recorder. Accepts absolute monotonic
 * timestamps; returns copied frozen metadata without changing input arrays.
 * @param {ReadonlyArray<NoteOnset>} onsets
 * @param {number} recordingStartMs Timestamp captured by the future recorder.
 * @returns {ReadonlyArray<NoteOnset>}
 */
export function orderNoteOnsets(onsets, recordingStartMs) {
  assertNonNegativeFinite(recordingStartMs, "recordingStartMs");
  if (!Array.isArray(onsets)) {
    throw new TypeError("onsets must be an array.");
  }
  const orders = new Set();
  const snapshots = [];
  for (const onset of onsets) {
    if (onset === null || typeof onset !== "object" || Array.isArray(onset)) {
      throw new TypeError("Each onset must be an object.");
    }
    const { midi, noteOnMs, onsetOrder } = onset;
    assertPianoMidi(midi);
    assertNonNegativeFinite(noteOnMs, "noteOnMs");
    if (noteOnMs < recordingStartMs) {
      throw new RangeError("noteOnMs cannot precede recordingStartMs.");
    }
    if (!Number.isSafeInteger(onsetOrder) || onsetOrder < 0 || orders.has(onsetOrder)) {
      throw new RangeError("onsetOrder must be a unique non-negative safe integer.");
    }
    orders.add(onsetOrder);
    snapshots.push(Object.freeze({ midi, noteOnMs, onsetOrder }));
  }
  return Object.freeze(snapshots.toSorted(
    (a, b) => a.noteOnMs - b.noteOnMs || a.onsetOrder - b.onsetOrder,
  ));
}

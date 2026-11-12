import { createRecordedNoteEvent } from "./contracts.js";
import { midiToFrequency } from "./notes.js";

export const MAX_RECORDED_NOTES = 500;

const EMPTY_TAKE = Object.freeze([]);
const IDLE = Object.freeze({
  status: "idle", takeId: 0, entries: EMPTY_TAKE, capturedCount: 0, limitReached: false,
});

/**
 * Records what actually SOUNDED, observed from the input store's pressedMidis:
 * a MIDI entering the set is a note-on, leaving it (release, blur or FIFO
 * steal) is a note-off. Notes already held when recording starts are ignored.
 * Entries are published only when a take stops; each entry pairs a stable ID
 * (take + admission order) with the frozen four-field RecordedNoteEvent.
 * Recording stops itself after MAX_RECORDED_NOTES onsets (limitReached).
 *
 * @param {{now?: () => number, maxNotes?: number}} [options]
 */
export function createRecorder({ now = () => performance.now(), maxNotes = MAX_RECORDED_NOTES } = {}) {
  if (!Number.isSafeInteger(maxNotes) || maxNotes < 1) throw new RangeError("maxNotes must be a positive integer.");
  let snapshot = IDLE;
  let previous = new Set();
  let startMs = 0;
  let nextOrder = 0;
  let open = new Map();
  let closed = [];
  const listeners = new Set();

  function publish(next) {
    snapshot = Object.freeze(next);
    for (const listener of listeners) listener();
  }

  function close(midi, offMs) {
    const onset = open.get(midi);
    if (!onset) return;
    open.delete(midi);
    closed.push({ ...onset, offMs: Math.max(offMs, onset.onMs) });
  }

  function stop() {
    if (snapshot.status !== "recording") return snapshot;
    const stopMs = now();
    for (const midi of [...open.keys()]) close(midi, stopMs);
    const ordered = closed.toSorted((a, b) => a.onMs - b.onMs || a.order - b.order);
    const takeId = snapshot.takeId;
    const entries = Object.freeze(ordered.map((note, position) => Object.freeze({
      id: `take-${takeId}-note-${note.order}`,
      event: createRecordedNoteEvent({
        midi: note.midi,
        freqHz: midiToFrequency(note.midi),
        durationMs: note.offMs - note.onMs,
        deltaMs: note.onMs - (position === 0 ? startMs : ordered[position - 1].onMs),
      }),
    })));
    open = new Map();
    closed = [];
    publish({ status: "idle", takeId, entries, capturedCount: entries.length, limitReached: snapshot.limitReached });
    return snapshot;
  }

  /** Feed every input snapshot; cheap no-op diff when nothing changed. */
  function observe(pressedMidis) {
    const current = new Set(pressedMidis);
    if (snapshot.status === "recording") {
      const at = now();
      for (const midi of previous) if (!current.has(midi)) close(midi, at);
      let added = false;
      for (const midi of current) {
        if (previous.has(midi) || open.has(midi)) continue;
        open.set(midi, { midi, onMs: at, order: nextOrder });
        nextOrder += 1;
        added = true;
        if (nextOrder >= maxNotes) {
          previous = current;
          publish({ ...snapshot, capturedCount: nextOrder, limitReached: true });
          stop();
          return;
        }
      }
      if (added) publish({ ...snapshot, capturedCount: nextOrder });
    }
    previous = current;
  }

  return Object.freeze({
    start(pressedMidis = [...previous]) {
      if (snapshot.status === "recording") return;
      previous = new Set(pressedMidis);
      startMs = now();
      nextOrder = 0;
      open = new Map();
      closed = [];
      publish({ status: "recording", takeId: snapshot.takeId + 1, entries: EMPTY_TAKE, capturedCount: 0, limitReached: false });
    },
    stop,
    observe,
    clear() {
      if (snapshot.status === "recording") return;
      publish({ ...IDLE, takeId: snapshot.takeId });
    },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => IDLE,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
  });
}

import { assertRecordedNoteEvent } from "./contracts.js";

export const REPLAY_SPEEDS = Object.freeze([0.5, 1, 2]);

/**
 * Pure FIFO schedule: onsets accumulate deltaMs / speed; each release is the
 * onset plus durationMs / speed, independent of the next onset (chords and
 * overlaps survive). Times are milliseconds from replay start.
 */
export function scheduleReplay(events, speed) {
  if (!REPLAY_SPEEDS.includes(speed)) throw new RangeError("speed must be 0.5, 1 or 2.");
  if (!Array.isArray(events)) throw new TypeError("events must be an array.");
  let onsetMs = 0;
  return Object.freeze(events.map((event, index) => {
    assertRecordedNoteEvent(event);
    onsetMs += event.deltaMs / speed;
    return Object.freeze({ index, midi: event.midi, onsetMs, releaseMs: onsetMs + event.durationMs / speed });
  }));
}

let nextRun = 1;

/**
 * Plays a schedule through the piano input store (press/release with owners).
 * Every timer is computed from the replay start, so delays never accumulate.
 * Aborting the signal synchronously clears every pending timer and releases
 * every note this run pressed; the promise then resolves {status:"aborted"}.
 * It never rejects. A run cannot release notes owned by another run.
 */
export function playSequence({
  events, speed, signal, press, release,
  now = () => performance.now(),
  setTimer = (callback, ms) => setTimeout(callback, ms),
  clearTimer = (id) => clearTimeout(id),
}) {
  const schedule = scheduleReplay(events, speed);
  const run = nextRun;
  nextRun += 1;
  return new Promise((resolve) => {
    if (signal?.aborted) {
      resolve({ status: "aborted", played: 0 });
      return;
    }
    const timers = new Set();
    const held = new Set();
    let released = 0;
    let played = 0;
    let settled = false;
    const startMs = now();
    const owner = (item) => `replay:${run}:${item.index}`;

    function finish(status) {
      if (settled) return;
      settled = true;
      signal?.removeEventListener("abort", onAbort);
      for (const id of timers) clearTimer(id);
      timers.clear();
      for (const id of held) release(id);
      held.clear();
      resolve({ status, played });
    }
    function onAbort() { finish("aborted"); }
    function at(targetMs, callback) {
      const id = setTimer(() => {
        timers.delete(id);
        if (!settled) callback();
      }, Math.max(0, startMs + targetMs - now()));
      timers.add(id);
    }

    signal?.addEventListener("abort", onAbort, { once: true });
    if (schedule.length === 0) {
      finish("completed");
      return;
    }
    for (const item of schedule) {
      at(item.onsetMs, () => {
        const id = owner(item);
        held.add(id);
        played += 1;
        void Promise.resolve(press(id, item.midi)).catch(() => {});
        at(Math.max(item.releaseMs, item.onsetMs), () => {
          held.delete(id);
          release(id);
          released += 1;
          if (released === schedule.length) finish("completed");
        });
      });
    }
  });
}

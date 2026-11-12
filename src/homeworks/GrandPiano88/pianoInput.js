import { assertPianoMidi } from "./notes.js";
import { PolyphonicSynth } from "./audio/PolyphonicSynth.js";

const EMPTY = Object.freeze({ pressedMidis: Object.freeze([]), error: null });

/**
 * Owns one synth and input sessions. Multiple inputs holding one MIDI share its
 * voice; only the last owner releases it. Stolen owners are retired immediately
 * after reconciliation. Exact returned voice tokens prevent stale-release races.
 * Construction is side-effect free; attach/detach is reusable for StrictMode.
 */
export function createPianoInput({ createSynth = () => new PolyphonicSynth() } = {}) {
  let synth = null;
  let snapshot = EMPTY;
  const listeners = new Set();
  const owners = new Map();
  const groups = new Map();

  function publish(error = snapshot.error) {
    const pressedMidis = [...groups.values()]
      .filter((group) => group.token)
      .map((group) => group.midi).toSorted((a, b) => a - b);
    if (error === snapshot.error && pressedMidis.length === snapshot.pressedMidis.length &&
        pressedMidis.every((midi, position) => midi === snapshot.pressedMidis[position])) return;
    snapshot = Object.freeze({ pressedMidis: Object.freeze(pressedMidis), error });
    for (const listener of listeners) listener();
  }

  function retire(group) {
    if (groups.get(group.midi) === group) groups.delete(group.midi);
    for (const owner of group.owners) {
      if (owners.get(owner) === group) owners.delete(owner);
    }
    group.owners.clear();
  }

  function reconcile(error) {
    const active = new Set(synth?.activeVoices ?? []);
    for (const group of groups.values()) {
      if (group.token && !active.has(group.token)) retire(group);
    }
    publish(error);
  }

  function release(owner) {
    const group = owners.get(owner);
    if (!group) return;
    owners.delete(owner);
    group.owners.delete(owner);
    if (group.owners.size === 0) {
      retire(group);
      if (group.token) group.synth.noteOff(group.token);
    }
    reconcile();
  }

  function press(owner, midi) {
    if (owners.has(owner)) return owners.get(owner).pending;
    try {
      assertPianoMidi(midi);
      if (!synth) synth = createSynth();
      let group = groups.get(midi);
      if (group) {
        group.owners.add(owner);
        owners.set(owner, group);
        return group.pending;
      }
      group = { midi, synth, owners: new Set([owner]), token: null, pending: null };
      groups.set(midi, group);
      owners.set(owner, group);
      // noteOn executes in the initiating event, preserving the user gesture.
      group.pending = Promise.resolve(group.synth.noteOn(midi)).then((result) => {
        if (groups.get(midi) !== group || synth !== group.synth) {
          if (result.ok) group.synth.noteOff(result.voice);
          return;
        }
        if (result.ok) {
          group.token = result.voice;
          reconcile(null);
        } else {
          retire(group);
          reconcile(result.error);
        }
      }).catch((error) => {
        if (groups.get(midi) === group) {
          retire(group);
          reconcile(error instanceof Error ? error.message : String(error));
        }
      });
      return group.pending;
    } catch (error) {
      const group = owners.get(owner);
      if (group) retire(group);
      publish(error instanceof Error ? error.message : String(error));
      return Promise.resolve();
    }
  }

  function releaseNote(midi) {
    const group = groups.get(midi);
    if (!group) return;
    for (const owner of [...group.owners]) release(owner);
  }

  function releaseAll() {
    for (const group of [...groups.values()]) retire(group);
    synth?.stopAll();
    publish();
  }

  function detach() {
    releaseAll();
    const retiringSynth = synth;
    synth = null;
    if (!retiringSynth) return Promise.resolve();
    return Promise.resolve(retiringSynth.dispose()).then((result) => {
      if (!result.ok && !synth) publish(result.error);
    }).catch((error) => {
      if (!synth) publish(error instanceof Error ? error.message : String(error));
    });
  }

  return Object.freeze({
    press, release, releaseNote, releaseAll, detach,
    tap: (midi) => {
      const owner = `assistive:${midi}`;
      return press(owner, midi).then(() => release(owner));
    },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => EMPTY,
    subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
    attach: (target) => {
      target.addEventListener("blur", releaseAll);
      return () => { target.removeEventListener("blur", releaseAll); void detach(); };
    },
  });
}

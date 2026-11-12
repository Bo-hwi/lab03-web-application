/**
 * The seven physical-key drum pads. These parameters are consumed by the
 * Web Audio synth in HW1-T3; no audio resources are allocated in this module.
 *
 * tone: a decaying oscillator whose pitch falls from frequencyHz to endFrequencyHz.
 * noise: filtered noise with an optional tonal body at frequencyHz.
 */
export const DRUM_PADS = Object.freeze([
  Object.freeze({
    id: "kick", code: "KeyW", key: "W", label: "Kick",
    synth: Object.freeze({ kind: "tone", frequencyHz: 150, endFrequencyHz: 52, durationMs: 280, gain: 0.75 }),
  }),
  Object.freeze({
    id: "snare", code: "KeyA", key: "A", label: "Snare",
    synth: Object.freeze({ kind: "noise", frequencyHz: 185, cutoffHz: 1800, durationMs: 180, gain: 0.5 }),
  }),
  Object.freeze({
    id: "closed-hat", code: "KeyS", key: "S", label: "Closed hi-hat",
    synth: Object.freeze({ kind: "noise", frequencyHz: 0, cutoffHz: 7000, durationMs: 65, gain: 0.22 }),
  }),
  Object.freeze({
    id: "open-hat", code: "KeyD", key: "D", label: "Open hi-hat",
    synth: Object.freeze({ kind: "noise", frequencyHz: 0, cutoffHz: 6000, durationMs: 360, gain: 0.2 }),
  }),
  Object.freeze({
    id: "low-tom", code: "KeyJ", key: "J", label: "Low tom",
    synth: Object.freeze({ kind: "tone", frequencyHz: 175, endFrequencyHz: 95, durationMs: 250, gain: 0.5 }),
  }),
  Object.freeze({
    id: "high-tom", code: "KeyK", key: "K", label: "High tom",
    synth: Object.freeze({ kind: "tone", frequencyHz: 270, endFrequencyHz: 150, durationMs: 190, gain: 0.4 }),
  }),
  Object.freeze({
    id: "clap", code: "KeyL", key: "L", label: "Clap",
    synth: Object.freeze({ kind: "noise", frequencyHz: 0, cutoffHz: 1400, durationMs: 210, gain: 0.4 }),
  }),
]);

const padsByCode = new Map(DRUM_PADS.map((pad) => [pad.code, pad]));
const padsById = new Map(DRUM_PADS.map((pad) => [pad.id, pad]));

export function getDrumPadByCode(code) {
  return padsByCode.get(code) ?? null;
}

export function getDrumPadById(id) {
  return padsById.get(id) ?? null;
}

import assert from "node:assert/strict";
import test from "node:test";
import { createPianoInput } from "../src/homeworks/GrandPiano88/pianoInput.js";
import { PolyphonicSynth } from "../src/homeworks/GrandPiano88/audio/PolyphonicSynth.js";
import { MockAudioContext, deferred } from "./helpers/mockAudio.js";

function setup(t, configure = () => {}) {
  const context = new MockAudioContext();
  configure(context);
  const synth = new PolyphonicSynth({ createContext: () => context });
  const input = createPianoInput({ createSynth: () => synth });
  t.after(() => input.detach());
  return { input, synth, context };
}

test("input store caches immutable snapshots and stable callback references", async (t) => {
  const { input } = setup(t);
  const before = input.getSnapshot();
  const press = input.press;
  let updates = 0;
  const unsubscribe = input.subscribe(() => { updates += 1; });
  await input.press("pointer:1", 60);
  assert.equal(input.press, press);
  assert.equal(input.getSnapshot(), input.getSnapshot());
  assert.deepEqual(before.pressedMidis, []);
  assert.deepEqual(input.getSnapshot().pressedMidis, [60]);
  assert.ok(Object.isFrozen(input.getSnapshot().pressedMidis));
  input.release("unknown");
  assert.equal(updates, 1);
  unsubscribe();
  input.release("pointer:1");
  assert.equal(updates, 1);
});

test("pointer start/release changes logical pressed state and releases exact token", async (t) => {
  const { input, synth } = setup(t);
  await input.press("pointer:1", 60);
  const token = synth.activeVoices[0];
  input.release("pointer:1");
  assert.deepEqual(input.getSnapshot().pressedMidis, []);
  assert.deepEqual(synth.releasingVoices, [token]);
});

test("two pointers and keyboard can share one MIDI until the last owner releases", async (t) => {
  const { input, synth, context } = setup(t);
  await input.press("pointer:1", 60);
  await input.press("pointer:2", 60);
  await input.press("keyboard:60:Enter", 60);
  assert.equal(context.oscillators.length, 1);
  input.release("pointer:1");
  input.release("keyboard:60:Enter");
  assert.equal(synth.activeVoices.length, 1);
  input.release("pointer:2");
  assert.equal(synth.activeVoices.length, 0);
});

test("repeated ownership does not start extra notes", async (t) => {
  const { input, context } = setup(t);
  await Promise.all([input.press("key", 60), input.press("key", 60)]);
  assert.equal(context.oscillators.length, 1);
  input.release("key");
  input.release("key");
  assert.deepEqual(input.getSnapshot().pressedMidis, []);
});

test("FIFO stealing removes the old pressed indicator and stale ownership cannot release new MIDI token", async (t) => {
  const { input, synth } = setup(t);
  for (let midi = 60; midi <= 68; midi += 1) await input.press(`pointer:${midi}`, midi);
  assert.deepEqual(input.getSnapshot().pressedMidis, [61, 62, 63, 64, 65, 66, 67, 68]);
  await input.press("replacement", 60);
  const replacement = synth.activeVoices.at(-1);
  input.release("pointer:60");
  assert.ok(synth.activeVoices.includes(replacement));
  assert.ok(input.getSnapshot().pressedMidis.includes(60));
});

test("release before resume resolves cannot leave a sounding or pressed note", async (t) => {
  const pending = deferred();
  const { input, synth, context } = setup(t, (ctx) => {
    ctx.state = "suspended";
    ctx.resumeImpl = () => pending.promise;
  });
  const start = input.press("pointer:1", 60);
  input.release("pointer:1");
  pending.resolve();
  await start;
  assert.deepEqual(synth.activeVoices, []);
  assert.deepEqual(input.getSnapshot().pressedMidis, []);
  context.advanceTo(0.05);
  assert.equal(context.soundingOscillators.length, 0);
});

test("pending old release cannot terminate a newer press of the same MIDI", async (t) => {
  const pending = deferred();
  const { input, synth } = setup(t, (ctx) => {
    ctx.state = "suspended";
    ctx.resumeImpl = () => pending.promise;
  });
  const old = input.press("old", 60);
  input.release("old");
  const newer = input.press("new", 60);
  pending.resolve();
  await Promise.all([old, newer]);
  assert.equal(synth.activeVoices.length, 1);
  assert.deepEqual(input.getSnapshot().pressedMidis, [60]);
  input.release("old");
  assert.equal(synth.activeVoices.length, 1);
});

test("window blur releases all, and cleanup removes listener and closes audio", async (t) => {
  const { input, synth, context } = setup(t);
  const target = new EventTarget();
  const cleanup = input.attach(target);
  await input.press("pointer:1", 60);
  target.dispatchEvent(new Event("blur"));
  assert.deepEqual(synth.activeVoices, []);
  assert.deepEqual(input.getSnapshot().pressedMidis, []);
  await input.press("pointer:2", 64);
  cleanup();
  await input.detach();
  assert.equal(synth.disposed, true);
  await Promise.resolve();
  assert.equal(context.state, "closed");
});

test("unmount while startup is pending does not revive a disposed session", async (t) => {
  const pending = deferred();
  const { input, synth, context } = setup(t, (ctx) => {
    ctx.state = "suspended";
    ctx.resumeImpl = () => pending.promise;
  });
  const start = input.press("pointer:1", 60);
  await input.detach();
  pending.resolve();
  await start;
  assert.equal(synth.disposed, true);
  assert.equal(context.oscillators.length, 0);
  assert.deepEqual(input.getSnapshot().pressedMidis, []);
});

test("StrictMode cleanup/setup can allocate a fresh engine without retaining old ownership", async (t) => {
  const synths = [];
  const input = createPianoInput({ createSynth: () => {
    const synth = new PolyphonicSynth({ createContext: () => new MockAudioContext() });
    synths.push(synth);
    return synth;
  } });
  t.after(() => input.detach());
  const target = new EventTarget();
  const cleanup = input.attach(target);
  await input.press("first", 60);
  cleanup();
  const cleanupAgain = input.attach(target);
  await input.press("second", 64);
  assert.equal(synths.length, 2);
  assert.equal(synths[0].disposed, true);
  assert.deepEqual(input.getSnapshot().pressedMidis, [64]);
  cleanupAgain();
});

test("startup failure is exposed in snapshot and a later successful gesture clears it", async (t) => {
  const { input, context } = setup(t, (ctx) => {
    ctx.state = "suspended";
    ctx.resumeImpl = () => Promise.reject(new Error("Gesture denied"));
  });
  await input.press("pointer:1", 60);
  assert.equal(input.getSnapshot().error, "Gesture denied");
  assert.deepEqual(input.getSnapshot().pressedMidis, []);
  context.resumeImpl = null;
  await input.press("pointer:2", 64);
  assert.equal(input.getSnapshot().error, null);
});

test("assistive click tap starts and releases one voice without disturbing a held owner", async (t) => {
  const { input, synth, context } = setup(t);
  await input.tap(60);
  assert.equal(context.oscillators.length, 1);
  assert.deepEqual(synth.activeVoices, []);
  await input.press("held", 64);
  await input.tap(64);
  assert.deepEqual(input.getSnapshot().pressedMidis, [64]);
  assert.equal(context.oscillators.length, 2);
});

test("factory throws and unexpectedly rejected startup promises are handled", async () => {
  const failedFactory = createPianoInput({ createSynth: () => { throw new Error("Factory unavailable"); } });
  await failedFactory.press("p", 60);
  assert.equal(failedFactory.getSnapshot().error, "Factory unavailable");
  const failedStart = createPianoInput({ createSynth: () => ({
    activeVoices: [], noteOn: () => Promise.reject(new Error("Unexpected startup rejection")),
    stopAll: () => {}, dispose: async () => ({ ok: true }),
  }) });
  await failedStart.press("p", 60);
  assert.equal(failedStart.getSnapshot().error, "Unexpected startup rejection");
  assert.deepEqual(failedStart.getSnapshot().pressedMidis, []);
  await failedStart.detach();
});

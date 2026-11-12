import assert from "node:assert/strict";
import test from "node:test";
import { createDrumSynth } from "../src/audio/drumSynth.js";
import { getDrumPadById } from "../src/data/drumPads.js";

class FakeParam {
  events = [];
  setValueAtTime(value, time) { this.events.push(["set", value, time]); }
  exponentialRampToValueAtTime(value, time) {
    assert.ok(value > 0);
    this.events.push(["ramp", value, time]);
  }
}

class FakeNode {
  connections = [];
  disconnected = false;
  onended = null;
  connect(node) { this.connections.push(node); return node; }
  disconnect() { this.disconnected = true; }
  start(time) { this.startedAt = time; }
  stop(time) { this.stoppedAt = time; }
}

function makeContext() {
  const sources = [];
  const gains = [];
  const filters = [];
  let closed = false;
  const context = {
    state: "running", currentTime: 10, sampleRate: 1_000, destination: new FakeNode(),
    createGain() { const node = new FakeNode(); node.gain = new FakeParam(); gains.push(node); return node; },
    createOscillator() { const node = new FakeNode(); node.frequency = new FakeParam(); sources.push(node); return node; },
    createBufferSource() { const node = new FakeNode(); sources.push(node); return node; },
    createBiquadFilter() { const node = new FakeNode(); node.frequency = new FakeParam(); filters.push(node); return node; },
    createBuffer(_channels, length) { return { getChannelData: () => new Float32Array(length) }; },
    async close() { closed = true; context.state = "closed"; },
    async resume() { context.state = "running"; },
  };
  return { context, sources, gains, filters, isClosed: () => closed };
}

test("drum synth creates Web Audio only on a hit, envelopes it and disconnects ended nodes", async () => {
  const fake = makeContext();
  let contextsCreated = 0;
  const synth = createDrumSynth({ createContext: () => { contextsCreated += 1; return fake.context; }, random: () => 0.75 });
  assert.equal(contextsCreated, 0);
  assert.equal(synth.getSnapshot().activeVoices, 0);

  await synth.play(getDrumPadById("kick"));
  await synth.play(getDrumPadById("snare"));
  assert.equal(contextsCreated, 1);
  assert.equal(synth.getSnapshot().activeVoices, 2);
  assert.ok(fake.sources.some((source) => source.buffer));
  assert.ok(fake.filters.length > 0);
  assert.ok(fake.gains.every((node) => node.gain.events.some(([kind, value]) => kind === "ramp" && value === 0.0001)));
  assert.ok(fake.sources.every((source) => source.startedAt === 10 && source.stoppedAt > 10));

  for (const source of fake.sources) source.onended?.();
  assert.equal(synth.getSnapshot().activeVoices, 0);
  assert.ok(fake.sources.every((source) => source.disconnected));
  await synth.dispose();
  assert.equal(fake.isClosed(), true);
  await assert.rejects(synth.play(getDrumPadById("kick")), /disposed/);
});

test("dispose stops all sources and prevents a suspended startup from creating late voices", async () => {
  const fake = makeContext();
  const synth = createDrumSynth({ createContext: () => fake.context });
  await synth.play(getDrumPadById("kick"));
  assert.equal(synth.getSnapshot().activeVoices, 1);
  await synth.dispose();
  assert.equal(synth.getSnapshot().activeVoices, 0);
  assert.ok(fake.sources.every((source) => source.disconnected));

  const suspended = makeContext();
  suspended.context.state = "suspended";
  let finishResume;
  suspended.context.resume = () => new Promise((resolve) => { finishResume = resolve; });
  const pendingSynth = createDrumSynth({ createContext: () => suspended.context });
  const pendingHit = pendingSynth.play(getDrumPadById("kick"));
  await pendingSynth.dispose();
  finishResume();
  await pendingHit;
  assert.equal(suspended.sources.length, 0);
  assert.equal(suspended.isClosed(), true);
});

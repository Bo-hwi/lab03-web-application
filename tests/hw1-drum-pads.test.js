import assert from "node:assert/strict";
import test from "node:test";
import { DRUM_PADS, getDrumPadByCode, getDrumPadById } from "../src/data/drumPads.js";

test("the physical W A S D J K L codes resolve to seven distinct stable pads", () => {
  const codes = ["KeyW", "KeyA", "KeyS", "KeyD", "KeyJ", "KeyK", "KeyL"];
  assert.equal(DRUM_PADS.length, 7);
  assert.deepEqual(DRUM_PADS.map((pad) => pad.code), codes);
  assert.equal(new Set(DRUM_PADS.map((pad) => pad.id)).size, 7);
  assert.equal(new Set(DRUM_PADS.map((pad) => pad.label)).size, 7);

  for (const pad of DRUM_PADS) {
    assert.equal(getDrumPadByCode(pad.code), pad);
    assert.equal(getDrumPadById(pad.id), pad);
    assert.equal(getDrumPadByCode(pad.code), getDrumPadByCode(pad.code));
    assert.equal(pad.key, pad.code.slice(3));
  }
  assert.equal(getDrumPadByCode("KeyQ"), null);
  assert.equal(getDrumPadByCode("w"), null);
  assert.equal(getDrumPadById("unknown"), null);
});

test("each pad has usable, immutable Web Audio synth parameters", () => {
  assert.ok(Object.isFrozen(DRUM_PADS));
  assert.ok(DRUM_PADS.some((pad) => pad.synth.kind === "tone"));
  assert.ok(DRUM_PADS.some((pad) => pad.synth.kind === "noise"));

  for (const pad of DRUM_PADS) {
    assert.ok(Object.isFrozen(pad));
    assert.ok(Object.isFrozen(pad.synth));
    assert.ok(pad.label.length > 0);
    assert.ok(Number.isFinite(pad.synth.durationMs) && pad.synth.durationMs > 0);
    assert.ok(Number.isFinite(pad.synth.gain) && pad.synth.gain > 0 && pad.synth.gain <= 1);
    if (pad.synth.kind === "tone") {
      assert.ok(pad.synth.frequencyHz > pad.synth.endFrequencyHz);
      assert.ok(pad.synth.endFrequencyHz > 0);
    } else {
      assert.equal(pad.synth.kind, "noise");
      assert.ok(pad.synth.cutoffHz > 0);
      assert.ok(pad.synth.frequencyHz >= 0);
    }
  }

  assert.throws(() => { DRUM_PADS[0].synth.gain = 2; }, TypeError);
  assert.equal(getDrumPadByCode("KeyW").synth.gain, 0.75);
});

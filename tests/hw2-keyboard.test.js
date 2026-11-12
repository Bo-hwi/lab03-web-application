import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { after, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

// SSR tests need transforms, not a network/HMR listener shared with other suites.
const vite = await createServer({ server: { middlewareMode: true, ws: false, hmr: false }, appType: "custom" });
after(() => vite.close());
const { PianoKey } = await vite.ssrLoadModule("/src/homeworks/GrandPiano88/PianoKey.jsx");
const { PianoKeyboard } = await vite.ssrLoadModule("/src/homeworks/GrandPiano88/PianoKeyboard.jsx");
const { PIANO_NOTES } = await vite.ssrLoadModule("/src/homeworks/GrandPiano88/notes.js");

function keyHandlers(midi = 60, isPressed = false) {
  const calls = [];
  const note = PIANO_NOTES.find((entry) => entry.midi === midi);
  const props = PianoKey.type({
    note, isPressed,
    onPress: (owner, noteMidi) => { calls.push(["press", owner, noteMidi]); return Promise.resolve(); },
    onRelease: (owner) => calls.push(["release", owner]),
    onTap: (noteMidi) => { calls.push(["tap", noteMidi]); return Promise.resolve(); },
  }).props;
  return { props, calls };
}

function event(extra = {}) {
  return {
    pointerId: 3, pointerType: "touch", button: 0, repeat: false,
    prevented: false, preventDefault() { this.prevented = true; },
    currentTarget: { focus() {}, setPointerCapture() {}, hasPointerCapture: () => false },
    ...extra,
  };
}

test("actual PianoKeyboard SSR renders 88 named MIDI-identified buttons and no div wrappers", () => {
  const html = renderToStaticMarkup(createElement(PianoKeyboard));
  assert.equal((html.match(/<button\b/g) ?? []).length, 88);
  assert.equal((html.match(/aria-pressed="false"/g) ?? []).length, 88);
  for (const note of PIANO_NOTES) {
    assert.ok(html.includes(`data-midi="${note.midi}"`));
    assert.ok(html.includes(`data-note-id="${note.id}"`));
    assert.ok(html.includes(`aria-label="Play ${note.noteName}"`));
  }
  assert.doesNotMatch(html, /<div\b/);
  assert.equal((html.match(/type="button"/g) ?? []).length, 88);
});

test("collection source uses generator entities as React keys; PianoKey is a real memo boundary", async () => {
  // React key is not emitted to HTML; inspect source explicitly rather than claiming SSR proves it.
  const source = await readFile(new URL("../src/homeworks/GrandPiano88/PianoKeyboard.jsx", import.meta.url), "utf8");
  assert.match(source, /PIANO_NOTES\.map/);
  assert.match(source, /key=\{note\.id\}/);
  assert.equal(PianoKey.$$typeof, Symbol.for("react.memo"));
  assert.equal(PianoKey.compare, null);
});

test("pointer handlers focus/capture, release on up/cancel/leave, and ignore synthetic pointer click", () => {
  const { props, calls } = keyHandlers();
  const focused = [];
  const down = event({ currentTarget: {
    focus: () => focused.push("focus"), setPointerCapture: (id) => focused.push(id),
  } });
  props.onPointerDown(down);
  assert.equal(down.prevented, true);
  assert.deepEqual(focused, ["focus", 3]);
  assert.deepEqual(calls.shift(), ["press", "pointer:3", 60]);
  for (const name of ["onPointerUp", "onPointerCancel", "onPointerLeave", "onLostPointerCapture"]) {
    props[name](event());
    assert.deepEqual(calls.shift(), ["release", "pointer:3"]);
  }
  props.onClick(event({ detail: 1 }));
  props.onPointerDown(event({ pointerType: "mouse", button: 2 }));
  assert.deepEqual(calls, []);
  props.onPointerMove(event({ clientX: 120, clientY: 20, currentTarget: {
    getBoundingClientRect: () => ({ left: 0, right: 100, top: 0, bottom: 100 }),
    hasPointerCapture: () => true, releasePointerCapture: () => {},
  } }));
  assert.deepEqual(calls, [["release", "pointer:3"]]);
});

test("Enter and Space own separate sessions, suppress repeat/native activation and release on keyup", () => {
  const { props, calls } = keyHandlers();
  for (const code of ["Enter", "Space"]) {
    const down = event({ code });
    props.onKeyDown(down);
    assert.equal(down.prevented, true);
    props.onKeyDown(event({ code, repeat: true }));
    props.onKeyUp(event({ code }));
    assert.deepEqual(calls.splice(0), [["press", `keyboard:60:${code}`, 60], ["release", `keyboard:60:${code}`]]);
  }
  props.onKeyDown(event({ code: "Space", isComposing: true }));
  props.onKeyDown(event({ code: "KeyW" }));
  assert.deepEqual(calls, []);
});

test("button blur releases keyboard owners while preserving multi-touch pointer ownership", () => {
  const { props, calls } = keyHandlers();
  props.onBlur();
  assert.deepEqual(calls, [["release", "keyboard:60:Enter"], ["release", "keyboard:60:Space"]]);
});

test("assistive click uses one tap and aria-pressed follows the supplied logical state", () => {
  const { props, calls } = keyHandlers(69, true);
  assert.equal(props["aria-pressed"], true);
  assert.equal(props["aria-label"], "Play A4");
  props.onClick(event({ detail: 0 }));
  assert.deepEqual(calls, [["tap", 69]]);
  assert.equal(keyHandlers(69, false).props["aria-pressed"], false);
});

test("arrow/Home/End navigation targets the appropriate note button", () => {
  const { props } = keyHandlers();
  const targets = [];
  const currentTarget = { closest: () => ({ querySelector: (selector) => ({ focus: () => targets.push(selector) }) }) };
  for (const code of ["ArrowLeft", "ArrowRight", "Home", "End"]) {
    const navigation = event({ code, currentTarget });
    props.onKeyDown(navigation);
    assert.equal(navigation.prevented, true);
  }
  assert.deepEqual(targets, ['[data-midi="59"]', '[data-midi="61"]', '[data-midi="21"]', '[data-midi="108"]']);
});

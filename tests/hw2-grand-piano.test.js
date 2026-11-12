import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const vite = await createServer({ server: { middlewareMode: true, ws: false, hmr: false }, appType: "custom" });
after(() => vite.close());
const { GrandPiano88 } = await vite.ssrLoadModule("/src/homeworks/GrandPiano88/GrandPiano88.jsx");
const { default: App } = await vite.ssrLoadModule("/src/App.jsx");

test("GrandPiano88 SSR: keyboard, labelled speed select, typed buttons, live status, no div", () => {
  let created = 0;
  const html = renderToStaticMarkup(createElement(GrandPiano88, { createSynth: () => { created += 1; return {}; } }));
  assert.equal(created, 0, "no audio engine before a user gesture");
  assert.equal((html.match(/data-midi="/g) ?? []).length, 88);
  const buttons = html.match(/<button\b[^>]*>/g) ?? [];
  assert.equal(buttons.length, 88 + 4);
  assert.ok(buttons.every((tag) => tag.includes('type="button"')));
  const select = html.match(/<select[^>]*id="([^"]+)"/);
  assert.ok(select && html.includes(`for="${select[1]}"`));
  for (const speed of ["0.5", "1", "2"]) assert.ok(html.includes(`value="${speed}"`));
  assert.match(html, /<output role="status" aria-live="polite"[^>]*>Ready\. Press Record/);
  assert.match(html, />Play<\/button>/);
  assert.ok(/<button type="button" disabled="">Play<\/button>/.test(html), "Play disabled with no take");
  assert.doesNotMatch(html, /<div\b/);
  assert.equal((html.match(/<h2\b/g) ?? []).length, 1);
  assert.equal((html.match(/<h3\b/g) ?? []).length, 2);
});

test("App mounts the HW2 page exactly once", () => {
  const html = renderToStaticMarkup(createElement(App));
  assert.equal((html.match(/HW2 · 88-Key Polyphonic Piano/g) ?? []).length, 1);
});

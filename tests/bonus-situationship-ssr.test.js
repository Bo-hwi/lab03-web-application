import assert from "node:assert/strict";
import test, { after } from "node:test";
import { createServer } from "vite";
import { renderToStaticMarkup } from "react-dom/server";

const server = await createServer({ server: { middlewareMode: true, ws: false, hmr: false }, appType: "custom" });
after(async () => { await server.close(); });

test("bonus SSR has labelled controls, status outputs and typed actions without div soup", async () => {
  const { SituationshipAnalyzer } = await server.ssrLoadModule("/src/bonus/SituationshipAnalyzer.jsx");
  const { createElement } = await import("react");
  const html = renderToStaticMarkup(createElement(SituationshipAnalyzer));
  assert.match(html, /Hẹn Hò Nhưng Không Yêu/);
  assert.match(html, /Hẹn hò nhưng không yêu/);
  assert.match(html, /Cờ đỏ/);
  assert.match(html, /<label for="[^"]+">Ai hành động\?<\/label>/);
  assert.match(html, /<label for="[^"]+">Số bước<\/label>/);
  assert.match(html, /type="number"[^>]*min="1"/);
  assert.match(html, /<output[^>]*role="status"[^>]*aria-live="polite"/);
  assert.doesNotMatch(html, /<div\b/);
  const buttons = html.match(/<button\b[^>]*>/g) ?? [];
  assert.ok(buttons.length >= 4);
  assert.ok(buttons.every((button) => button.includes('type="button"')));
});

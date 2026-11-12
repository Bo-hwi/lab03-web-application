import assert from "node:assert/strict";
import test, { after } from "node:test";
import { createServer } from "vite";
import { renderToStaticMarkup } from "react-dom/server";

const server = await createServer({ server: { middlewareMode: true, ws: false, hmr: false }, appType: "custom" });
after(async () => { await server.close(); });

test("arena SSR includes claim controls, named form fields, four squads and no div soup", async () => {
  const { KraftonPubgVnArena } = await server.ssrLoadModule("/src/homeworks/KraftonPubgVnArena/KraftonPubgVnArena.jsx");
  const { createElement } = await import("react");
  const html = renderToStaticMarkup(createElement(KraftonPubgVnArena));
  assert.match(html, /PVS Finals/);
  assert.match(html, /PVS Grand Finals VIP Ticket/);
  assert.match(html, /5,000 G-Coin Contraband Crate/);
  assert.match(html, /The Expendables/);
  assert.match(html, /Cerberus Esports/);
  assert.match(html, /Roy Esports/);
  assert.match(html, /AGG/);
  assert.match(html, /<label for="[^"]+">Find a squad<\/label>/);
  assert.match(html, /<label for="[^"]+">Rank by<\/label>/);
  assert.match(html, /<label for="[^"]+">Show squad<\/label>/);
  assert.doesNotMatch(html, /<div\b/);
  assert.equal((html.match(/<button type="button"/g) ?? []).length, 2);
});

import assert from "node:assert/strict";
import React from "react";
import { after, test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const vite = await createServer({ server: { middlewareMode: true }, appType: "custom" });
after(async () => vite.close());

const { DeveloperCard } = await vite.ssrLoadModule("/src/exercises/DeveloperCard.jsx");

test("DeveloperCard uses semantic elements without div soup", () => {
  const html = renderToStaticMarkup(React.createElement(DeveloperCard));
  assert.match(html, /<article\b/);
  for (const tag of ["header", "dl", "dt", "dd", "section", "ul", "li"]) {
    assert.match(html, new RegExp(`<${tag}\\b`));
  }
  assert.doesNotMatch(html, /<div\b/);
});

test("DeveloperCard uses stable skill IDs and explicit avatar dimensions", () => {
  const html = renderToStaticMarkup(React.createElement(DeveloperCard));
  assert.match(html, /width="80" height="80"/);
  assert.match(html, /src="https:\/\//);
  assert.equal((html.match(/<li class=/g) ?? []).length, 4);
});

import assert from "node:assert/strict";
import test from "node:test";
import { requestSquadTelemetry } from "../src/data/pubgTelemetry.js";
import { PUBG_VN_SQUADS } from "../src/data/pubgSquads.js";

const makeFetch = (record, capture = () => {}) => async (url, options) => {
  capture(url, options);
  return { ok: true, json: async () => record };
};

test("all three squads have stable IDs and expected maps", () => {
  assert.deepEqual(PUBG_VN_SQUADS.map(({ id, map }) => [id, map]), [
    ["ces", "Erangel"],
    ["te", "Miramar"],
    ["ge", "Taego"],
  ]);
});

test("Erangel and Miramar lose a packet below the 35% threshold", async () => {
  for (const squadId of ["ces", "te"]) {
    await assert.rejects(
      requestSquadTelemetry(squadId, {
        fetchImpl: makeFetch({ id: squadId }),
        delayMs: 0,
        random: () => 0.34,
      }),
      /Satellite packet lost/,
    );
    assert.deepEqual(
      await requestSquadTelemetry(squadId, {
        fetchImpl: makeFetch({ id: squadId }),
        delayMs: 0,
        random: () => 0.35,
      }),
      { id: squadId },
    );
  }
  assert.deepEqual(
    await requestSquadTelemetry("ge", {
      fetchImpl: makeFetch({ id: "ge" }),
      delayMs: 0,
      random: () => 0,
    }),
    { id: "ge" },
  );
});

test("aborting a satellite request rejects with AbortError", async () => {
  const controller = new AbortController();
  let receivedSignal;
  const request = requestSquadTelemetry("te", {
    signal: controller.signal,
    fetchImpl: makeFetch({ id: "te" }, (_url, options) => {
      receivedSignal = options.signal;
    }),
    delayMs: 200,
  });
  await new Promise((resolve) => setTimeout(resolve, 10));
  controller.abort();
  await assert.rejects(request, { name: "AbortError" });
  assert.equal(receivedSignal, controller.signal);
});

test("invalid squads and unsuccessful responses fail clearly", async () => {
  await assert.rejects(requestSquadTelemetry("missing"), /Unknown squad/);
  await assert.rejects(
    requestSquadTelemetry("ces", {
      fetchImpl: async () => ({ ok: false }),
    }),
    /unavailable/,
  );
});

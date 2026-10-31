import { PUBG_VN_SQUADS } from "./pubgSquads.js";

export async function requestSquadTelemetry(
  squadId,
  { signal, fetchImpl = fetch, random = Math.random, delayMs = 900, baseUrl = "./telemetry/" } = {},
) {
  const squad = PUBG_VN_SQUADS.find((entry) => entry.id === squadId);
  if (!squad) {
    throw new Error("Unknown squad.");
  }

  const response = await fetchImpl(`${baseUrl}${squadId}.json`, { signal });
  if (!response.ok) {
    throw new Error("Satellite telemetry is unavailable.");
  }

  const data = await response.json();
  await waitForPacket(delayMs, signal);
  if (signal?.aborted) {
    throw new DOMException("Request cancelled.", "AbortError");
  }
  if (squad.map !== "Taego" && random() < 0.35) {
    throw new Error("Satellite packet lost. Reconnect to try again.");
  }
  return data;
}

function waitForPacket(delayMs, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Request cancelled.", "AbortError"));
      return;
    }

    let timer;
    const onAbort = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      reject(new DOMException("Request cancelled.", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
    timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, delayMs);
  });
}

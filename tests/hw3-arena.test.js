import assert from "node:assert/strict";
import test from "node:test";
import {
  createArenaDrops, formatVnd, getDropPhase, KILL_FEED,
  selectKillFeed, selectStandings, SQUAD_STANDINGS,
} from "../src/homeworks/KraftonPubgVnArena/arenaData.js";
import { getRemainingMs, startAirdropClock } from "../src/homeworks/KraftonPubgVnArena/usePubgAirdropTimer.js";
import { createClaimManager, createDemoClaimService } from "../src/homeworks/KraftonPubgVnArena/claims.js";

const makeDeferred = () => {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
};

test("drop timing uses absolute epochs, server offset and exact phase boundaries", () => {
  const [ticket, crate] = createArenaDrops(1_000_000);
  assert.equal(ticket.dropEpochMs, 1_000_000);
  assert.equal(crate.dropEpochMs, 1_020_000);
  assert.equal(getRemainingMs(crate.dropEpochMs, 500, 1_000_000), 19_500);
  assert.equal(getRemainingMs(crate.dropEpochMs, 500, 1_030_000), 0);
  assert.equal(getDropPhase(crate, crate.dropEpochMs - 1), "WARMUP");
  assert.equal(getDropPhase(crate, crate.dropEpochMs), "AIRDROP_LIVE");
  assert.equal(getDropPhase(crate, crate.dropEpochMs, 0), "LOOTED_OUT");
  assert.equal(getDropPhase(crate, crate.expiresEpochMs), "EXPIRED");
  assert.equal(getDropPhase(crate, crate.expiresEpochMs + 1), "EXPIRED");
  assert.ok(Object.isFrozen(crate));
  assert.match(formatVnd(ticket.priceVnd), /1[.\s]200[.\s]000/);
  assert.match(formatVnd(ticket.priceVnd), /₫/);
});

test("clock resyncs from wall time after throttling and wake, then cleans up", () => {
  let wallNow = 1_000;
  let tick, wake, cleared = false, removed = false;
  const seen = [];
  const timerHost = {
    setInterval(callback, delay) { assert.equal(delay, 200); tick = callback; return 7; },
    clearInterval(id) { assert.equal(id, 7); cleared = true; },
  };
  const documentHost = {
    visibilityState: "hidden",
    addEventListener(name, callback) { assert.equal(name, "visibilitychange"); wake = callback; },
    removeEventListener(name, callback) { assert.equal(name, "visibilitychange"); assert.equal(callback, wake); removed = true; },
  };
  const cleanup = startAirdropClock((value) => seen.push(value), { timerHost, documentHost, now: () => wallNow });
  wallNow = 61_000;
  tick();
  wallNow = 121_000;
  wake();
  documentHost.visibilityState = "visible";
  wake();
  assert.deepEqual(seen, [1_000, 61_000, 121_000]);
  assert.equal(getRemainingMs(130_000, 0, seen.at(-1)), 9_000);
  cleanup();
  assert.equal(cleared, true);
  assert.equal(removed, true);
});

test("leaderboard sorting and kill-feed filtering are derived without changing source order", () => {
  assert.deepEqual(selectStandings(SQUAD_STANDINGS, "", "wwcdCount").map((squad) => squad.squadId), ["te", "agg", "ces", "roy"]);
  assert.deepEqual(selectStandings(SQUAD_STANDINGS, "", "placementPts").map((squad) => squad.squadId), ["ces", "te", "agg", "roy"]);
  assert.deepEqual(selectStandings(SQUAD_STANDINGS, "", "killPts").map((squad) => squad.squadId), ["te", "agg", "ces", "roy"]);
  assert.deepEqual(selectStandings(SQUAD_STANDINGS, "  CERBERUS ").map((squad) => squad.squadId), ["ces"]);
  assert.deepEqual(SQUAD_STANDINGS.map((squad) => squad.squadId), ["te", "ces", "roy", "agg"]);
  assert.deepEqual(selectKillFeed(KILL_FEED, "agg").map((event) => event.id), ["kill-3"]);
  assert.equal(selectKillFeed(KILL_FEED).length, 4);
  assert.throws(() => selectStandings(SQUAD_STANDINGS, "", "__proto__"), RangeError);
});

test("claim immediately reserves stock, blocks duplicate clicks and rolls back a 409 once", async () => {
  const drops = createArenaDrops(0);
  const deferred = makeDeferred();
  const calls = [];
  const manager = createClaimManager(drops, (request) => { calls.push(request); return deferred.promise; });
  let updates = 0;
  const unsubscribe = manager.subscribe(() => { updates += 1; });
  const original = manager.getSnapshot();
  const claim = manager.claim("pvs-vip");
  assert.equal(manager.getSnapshot()[0].stock, 1);
  assert.equal(manager.getSnapshot()[0].pending, true);
  assert.equal(original[0].stock, 2);
  assert.ok(Object.isFrozen(manager.getSnapshot()[0]));
  assert.deepEqual(await manager.claim("pvs-vip"), { status: "busy" });
  assert.equal(calls.length, 1);
  deferred.resolve({ status: 409 });
  assert.equal((await claim).status, "conflict");
  assert.equal(manager.getSnapshot()[0].stock, 2);
  assert.equal(manager.getSnapshot()[0].pending, false);
  assert.equal(manager.getSnapshot()[0].result, "conflict");
  assert.equal(updates, 2);
  unsubscribe();
});

test("different drops claim concurrently and a successful claim keeps its reservation", async () => {
  const first = makeDeferred(), second = makeDeferred();
  const manager = createClaimManager(createArenaDrops(0), ({ dropId }) => dropId === "pvs-vip" ? first.promise : second.promise);
  const ticket = manager.claim("pvs-vip"), crate = manager.claim("gcoin-crate");
  assert.deepEqual(manager.getSnapshot().map((item) => item.stock), [1, 2]);
  first.resolve({ status: 200 });
  second.resolve({ status: 503 });
  assert.equal((await ticket).status, "success");
  assert.equal((await crate).status, "error");
  assert.deepEqual(manager.getSnapshot().map((item) => item.stock), [1, 3]);
  assert.deepEqual(await manager.claim("missing"), { status: "unknown" });
});

test("cleanup aborts pending claims and late responses cannot change restored stock", async () => {
  const deferred = makeDeferred();
  let signal;
  const manager = createClaimManager(createArenaDrops(0), (request) => { signal = request.signal; return deferred.promise; });
  const task = manager.claim("pvs-vip");
  manager.cancelAll();
  assert.equal(signal.aborted, true);
  assert.equal(manager.getSnapshot()[0].stock, 2);
  deferred.resolve({ status: 200 });
  assert.deepEqual(await task, { status: "aborted" });
  assert.equal(manager.getSnapshot()[0].stock, 2);
});

test("an old aborted response cannot settle or restore a newer claim on the same drop", async () => {
  const oldRequest = makeDeferred(), newRequest = makeDeferred();
  let calls = 0;
  const manager = createClaimManager(createArenaDrops(0), () => ++calls === 1 ? oldRequest.promise : newRequest.promise);
  const oldClaim = manager.claim("pvs-vip");
  manager.cancelAll();
  const nextClaim = manager.claim("pvs-vip");
  oldRequest.resolve({ status: 409 });
  assert.deepEqual(await oldClaim, { status: "aborted" });
  assert.equal(manager.getSnapshot()[0].stock, 1);
  assert.equal(manager.getSnapshot()[0].pending, true);
  newRequest.resolve({ status: 200 });
  assert.equal((await nextClaim).status, "success");
  assert.equal(manager.getSnapshot()[0].stock, 1);
});

test("demo service gives one success then a deterministic 409 for the ticket", async () => {
  const drops = createArenaDrops(0);
  const manager = createClaimManager(drops, createDemoClaimService(drops, 0));
  assert.equal((await manager.claim("pvs-vip")).status, "success");
  assert.equal((await manager.claim("pvs-vip")).status, "conflict");
  assert.equal(manager.getSnapshot()[0].stock, 1);
});

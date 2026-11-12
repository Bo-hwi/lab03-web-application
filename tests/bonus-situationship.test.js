import assert from "node:assert/strict";
import test from "node:test";
import { createInitialSituationship, deriveEffort, RELATIONSHIP_PHASES, situationshipReducer } from "../src/bonus/situationship.js";
import { waitForReplyTimeout } from "../src/bonus/ghosting.js";

test("strict FSM has four phases and requires a reply before mutual commitment", () => {
  assert.deepEqual(RELATIONSHIP_PHASES, ["STRANGERS", "DATING_NO_LOVE", "COMMITTED", "SELF_RESPECT_EXIT"]);
  const initial = createInitialSituationship();
  assert.equal(initial.phase, "DATING_NO_LOVE");
  assert.equal(situationshipReducer(initial, { type: "MUTUAL_COMMITMENT" }), initial);
  const waiting = situationshipReducer(initial, { type: "SEND_MESSAGE", id: "message-1" });
  assert.equal(waiting.pendingMessageId, "message-1");
  assert.equal(situationshipReducer(waiting, { type: "REPLY_RECEIVED", id: "old-message" }), waiting);
  const replied = situationshipReducer(waiting, { type: "REPLY_RECEIVED", id: "message-1" });
  assert.equal(replied.pendingMessageId, null);
  assert.equal(situationshipReducer(replied, { type: "MUTUAL_COMMITMENT" }).phase, "COMMITTED");
  assert.equal(initial.pendingMessageId, null);
  assert.ok(Object.isFrozen(initial));
});

test("ghost timeout only exits the currently pending message; stop and restart preserve legal transitions", () => {
  const initial = createInitialSituationship();
  assert.equal(situationshipReducer(initial, { type: "GHOST_TIMEOUT", id: null }), initial);
  assert.equal(situationshipReducer(initial, { type: "SEND_MESSAGE", id: 42 }), initial);
  const first = situationshipReducer(initial, { type: "SEND_MESSAGE", id: "m1" });
  assert.equal(situationshipReducer(first, { type: "GHOST_TIMEOUT", id: "m0" }), first);
  const exit = situationshipReducer(first, { type: "GHOST_TIMEOUT", id: "m1" });
  assert.equal(exit.phase, "SELF_RESPECT_EXIT");
  assert.equal(exit.replyStatus, "ignored");
  assert.equal(exit.pendingMessageId, null);
  assert.equal(situationshipReducer(exit, { type: "SEND_MESSAGE", id: "m2" }), exit);
  const strangers = situationshipReducer(exit, { type: "RESTART" });
  assert.equal(strangers.phase, "STRANGERS");
  assert.equal(situationshipReducer(strangers, { type: "BEGIN_DATING" }).phase, "DATING_NO_LOVE");
  assert.equal(situationshipReducer(first, { type: "SWITCH_TO_AI_DO" }).pendingMessageId, null);
  assert.equal(situationshipReducer(first, { type: "STOP" }).phase, "SELF_RESPECT_EXIT");
});

test("effort entries are immutable, uniquely identified and scores are derived without state sync", () => {
  const initial = createInitialSituationship();
  assert.deepEqual(deriveEffort(initial.signals, initial.phase), { emScore: 10, rivalScore: 50, redFlag: true });
  const changed = situationshipReducer(initial, { type: "ADD_SIGNAL", signal: { id: "extra", actor: "EM", steps: 500 } });
  assert.equal(changed.signals.length, 3);
  assert.equal(initial.signals.length, 2);
  assert.ok(Object.isFrozen(changed.signals));
  assert.ok(Object.isFrozen(changed.signals.at(-1)));
  assert.deepEqual(changed.signals.at(-1), { id: "extra", type: "EFFORT", actor: "EM", steps: 500, multiplier: 0.1, impact: 50 });
  assert.deepEqual(deriveEffort(changed.signals, changed.phase), { emScore: 60, rivalScore: 50, redFlag: false });
  assert.equal(situationshipReducer(changed, { type: "ADD_SIGNAL", signal: { id: "extra", actor: "EM", steps: 1 } }), changed);
  assert.equal(situationshipReducer(changed, { type: "ADD_SIGNAL", signal: { id: "bad", actor: "toString", steps: 1 } }), changed);
  assert.equal(situationshipReducer(changed, { type: "ADD_SIGNAL", signal: { id: "zero", actor: "EM", steps: 0 } }), changed);
});

test("5-second wait resolves and removes its abort listener", async () => {
  const controller = new AbortController();
  let fire, timeoutDelay, removed = false;
  const originalRemove = controller.signal.removeEventListener.bind(controller.signal);
  controller.signal.removeEventListener = (...args) => { removed = true; return originalRemove(...args); };
  const timers = { setTimeout(callback, delay) { fire = callback; timeoutDelay = delay; return 11; }, clearTimeout() { throw Error("not cancelled"); } };
  const task = waitForReplyTimeout(controller.signal, 5_000, timers);
  assert.equal(timeoutDelay, 5_000);
  fire();
  await task;
  assert.equal(removed, true);
});

test("reply, phase change or unmount can abort the wait and clear its timer", async () => {
  const controller = new AbortController();
  let cleared;
  const timers = { setTimeout() { return 17; }, clearTimeout(id) { cleared = id; } };
  const task = waitForReplyTimeout(controller.signal, 5_000, timers);
  controller.abort();
  await assert.rejects(task, { name: "AbortError" });
  assert.equal(cleared, 17);
  await assert.rejects(waitForReplyTimeout(controller.signal, 5_000, timers), { name: "AbortError" });
});

export const RELATIONSHIP_PHASES = Object.freeze([
  "STRANGERS", "DATING_NO_LOVE", "COMMITTED", "SELF_RESPECT_EXIT",
]);

export const EFFORT_WEIGHTS = Object.freeze({ EM: 0.1, AI_DO: 50 });

function freezeState(state) {
  return Object.freeze({ ...state, signals: Object.freeze(state.signals) });
}

export function createInitialSituationship() {
  return freezeState({
    phase: "DATING_NO_LOVE",
    pendingMessageId: null,
    replyStatus: "idle",
    signals: [
      Object.freeze({ id: "initial-em", type: "EFFORT", actor: "EM", steps: 100, multiplier: EFFORT_WEIGHTS.EM, impact: 10 }),
      Object.freeze({ id: "initial-ai-do", type: "EFFORT", actor: "AI_DO", steps: 1, multiplier: EFFORT_WEIGHTS.AI_DO, impact: 50 }),
    ],
  });
}

export function deriveEffort(signals, phase) {
  const emScore = signals.filter((signal) => signal.actor === "EM")
    .reduce((sum, signal) => sum + signal.impact, 0);
  const rivalScore = signals.filter((signal) => signal.actor === "AI_DO")
    .reduce((sum, signal) => sum + signal.impact, 0);
  return Object.freeze({ emScore, rivalScore, redFlag: phase === "DATING_NO_LOVE" && emScore < rivalScore });
}

export function situationshipReducer(state, action) {
  switch (action.type) {
    case "ADD_SIGNAL": {
      const { signal } = action;
      if (!signal || !Number.isSafeInteger(signal.steps) || signal.steps <= 0
        || !Object.hasOwn(EFFORT_WEIGHTS, signal.actor) || typeof signal.id !== "string" || !signal.id
        || state.signals.some((existing) => existing.id === signal.id)) return state;
      const multiplier = EFFORT_WEIGHTS[signal.actor];
      const entry = Object.freeze({ id: signal.id, type: "EFFORT", actor: signal.actor, steps: signal.steps, multiplier, impact: signal.steps * multiplier });
      return freezeState({ ...state, signals: [...state.signals, entry] });
    }
    case "SEND_MESSAGE":
      if (state.phase !== "DATING_NO_LOVE" || state.pendingMessageId || typeof action.id !== "string" || !action.id) return state;
      return freezeState({ ...state, pendingMessageId: action.id, replyStatus: "waiting" });
    case "REPLY_RECEIVED":
      if (!state.pendingMessageId || state.pendingMessageId !== action.id) return state;
      return freezeState({ ...state, pendingMessageId: null, replyStatus: "replied" });
    case "GHOST_TIMEOUT":
      if (state.phase !== "DATING_NO_LOVE" || !state.pendingMessageId || state.pendingMessageId !== action.id) return state;
      return freezeState({ ...state, phase: "SELF_RESPECT_EXIT", pendingMessageId: null, replyStatus: "ignored" });
    case "MUTUAL_COMMITMENT":
      if (state.phase !== "DATING_NO_LOVE" || state.replyStatus !== "replied") return state;
      return freezeState({ ...state, phase: "COMMITTED", pendingMessageId: null, replyStatus: "replied" });
    case "STOP":
    case "SWITCH_TO_AI_DO":
      if (state.phase === "SELF_RESPECT_EXIT") return state;
      return freezeState({ ...state, phase: "SELF_RESPECT_EXIT", pendingMessageId: null, replyStatus: "cancelled" });
    case "RESTART":
      if (state.phase !== "SELF_RESPECT_EXIT") return state;
      return freezeState({ ...state, phase: "STRANGERS", pendingMessageId: null, replyStatus: "idle" });
    case "BEGIN_DATING":
      if (state.phase !== "STRANGERS") return state;
      return freezeState({ ...state, phase: "DATING_NO_LOVE", pendingMessageId: null, replyStatus: "idle" });
    default:
      return state;
  }
}

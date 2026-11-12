function freezeSnapshot(items) {
  return Object.freeze(items.map((item) => Object.freeze(item)));
}

/** A framework-free optimistic inventory store with one in-flight claim per drop. */
export function createClaimManager(drops, requestClaim) {
  if (typeof requestClaim !== "function") throw new TypeError("requestClaim must be a function");
  let snapshot = freezeSnapshot(drops.map((drop) => ({
    id: drop.id, stock: drop.remainingStock, pending: false, result: "idle", message: "",
  })));
  const listeners = new Set();
  const pending = new Map();
  let sequence = 0;

  const publish = (id, patch) => {
    snapshot = freezeSnapshot(snapshot.map((item) => item.id === id ? { ...item, ...patch } : item));
    for (const listener of listeners) listener();
  };
  const getSnapshot = () => snapshot;
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  async function claim(dropId) {
    const item = snapshot.find((entry) => entry.id === dropId);
    if (!item) return { status: "unknown" };
    if (pending.has(dropId)) return { status: "busy" };
    if (item.stock <= 0) return { status: "sold-out" };

    const claimId = `claim-${++sequence}`;
    const controller = new AbortController();
    pending.set(dropId, { claimId, controller });
    publish(dropId, { stock: item.stock - 1, pending: true, result: "pending", message: "Checking availability…" });

    let response;
    try {
      response = await requestClaim({ dropId, claimId, signal: controller.signal });
    } catch (error) {
      response = { status: error?.name === "AbortError" ? "aborted" : "error" };
    }
    if (pending.get(dropId)?.claimId !== claimId) return { status: "aborted" };
    pending.delete(dropId);

    if (response?.status === 200) {
      publish(dropId, { pending: false, result: "success", message: "Claim confirmed." });
      return { status: "success", claimId };
    }
    const current = snapshot.find((entry) => entry.id === dropId);
    const conflict = response?.status === 409;
    publish(dropId, {
      stock: current.stock + 1,
      pending: false,
      result: conflict ? "conflict" : "error",
      message: conflict ? "Server stock was sold out. Local stock restored." : "Claim failed. Local stock restored.",
    });
    return { status: conflict ? "conflict" : "error", claimId };
  }

  function cancelAll() {
    const pendingIds = [...pending.keys()];
    for (const { controller } of pending.values()) controller.abort();
    pending.clear();
    if (pendingIds.length === 0) return;
    snapshot = freezeSnapshot(snapshot.map((item) => pendingIds.includes(item.id)
      ? { ...item, stock: item.stock + 1, pending: false, result: "idle", message: "" }
      : item));
    for (const listener of listeners) listener();
  }

  return Object.freeze({ getSnapshot, subscribe, claim, cancelAll });
}

/** Local deterministic service for the demo page; replace with a real API adapter later. */
export function createDemoClaimService(drops, latencyMs = 550) {
  const serverStock = new Map(drops.map((drop) => [drop.id, Math.max(0, drop.remainingStock - 1)]));
  const responses = new Map();

  return ({ dropId, claimId, signal }) => new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Claim cancelled", "AbortError"));
      return;
    }
    const onAbort = () => {
      clearTimeout(timerId);
      reject(new DOMException("Claim cancelled", "AbortError"));
    };
    const timerId = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      let status = responses.get(claimId);
      if (status === undefined) {
        const stock = serverStock.get(dropId) ?? 0;
        status = stock > 0 ? 200 : 409;
        if (status === 200) serverStock.set(dropId, stock - 1);
        responses.set(claimId, status);
      }
      resolve({ status });
    }, latencyMs);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

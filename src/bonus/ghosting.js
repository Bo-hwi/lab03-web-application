const defaultTimers = {
  setTimeout: (...args) => globalThis.setTimeout(...args),
  clearTimeout: (id) => globalThis.clearTimeout(id),
};

/** Resolves after the reply window, or rejects on cancellation with no retained timer. */
export function waitForReplyTimeout(signal, delayMs = 5_000, timers = defaultTimers) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Reply wait cancelled", "AbortError"));
      return;
    }
    const onAbort = () => {
      timers.clearTimeout(timerId);
      signal.removeEventListener("abort", onAbort);
      reject(new DOMException("Reply wait cancelled", "AbortError"));
    };
    const timerId = timers.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, delayMs);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

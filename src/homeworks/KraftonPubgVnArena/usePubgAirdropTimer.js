import { useEffect, useState } from "react";

export function getRemainingMs(targetEpochMs, serverOffsetMs = 0, nowMs = Date.now()) {
  return Math.max(0, targetEpochMs - (nowMs + serverOffsetMs));
}

export function startAirdropClock(onSync, { timerHost, documentHost, now = Date.now }) {
  const syncClock = () => onSync(now());
  syncClock();
  const timerId = timerHost.setInterval(syncClock, 200);
  const onWake = () => {
    if (documentHost.visibilityState === "visible") syncClock();
  };
  documentHost.addEventListener("visibilitychange", onWake);
  return () => {
    timerHost.clearInterval(timerId);
    documentHost.removeEventListener("visibilitychange", onWake);
  };
}

/** Resyncs from wall time on every tick and immediately when a background tab wakes. */
export function usePubgAirdropTimer(targetEpochMs, serverOffsetMs = 0) {
  const [clockMs, setClockMs] = useState(() => Date.now());

  useEffect(() => startAirdropClock(setClockMs, { timerHost: window, documentHost: document }), [targetEpochMs, serverOffsetMs]);

  const nowMs = clockMs + serverOffsetMs;
  const remainingMs = getRemainingMs(targetEpochMs, serverOffsetMs, clockMs);
  return { nowMs, remainingMs, isLive: remainingMs === 0 };
}

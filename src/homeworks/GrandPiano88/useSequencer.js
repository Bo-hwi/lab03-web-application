import { useEffect, useRef, useState } from "react";
import { playSequence } from "./sequencePlayer.js";

const IDLE = Object.freeze({ status: "idle", speed: null, outcome: null });

/**
 * Abortable replay through the shared input store. Starting a new replay or
 * stopping aborts the previous one first; only the current run may update
 * state. Unmount aborts the active run (timers cleared, notes released).
 */
export function useSequencer(input) {
  const [playback, setPlayback] = useState(IDLE);
  const controllerRef = useRef(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  function stop() {
    controllerRef.current?.abort();
  }

  function play(events, speed) {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setPlayback({ status: "playing", speed, outcome: null });
    let result;
    try {
      result = playSequence({ events, speed, signal: controller.signal, press: input.press, release: input.release });
    } catch (error) {
      controllerRef.current = null;
      setPlayback({ status: "idle", speed, outcome: error instanceof Error ? error.message : String(error) });
      return;
    }
    void result.then(({ status }) => {
      if (controllerRef.current !== controller) return;
      controllerRef.current = null;
      setPlayback({ status: "idle", speed, outcome: status });
    });
  }

  return { playback, play, stop };
}

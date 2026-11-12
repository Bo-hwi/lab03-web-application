import { useEffect, useState, useSyncExternalStore } from "react";
import { createRecorder } from "./recording.js";

/** Records sounding notes from a piano input store. Construction is side-effect free. */
export function useRecorder(input) {
  const [recorder] = useState(() => createRecorder());
  const snapshot = useSyncExternalStore(recorder.subscribe, recorder.getSnapshot, recorder.getServerSnapshot);
  useEffect(() => {
    recorder.observe(input.getSnapshot().pressedMidis);
    const unsubscribe = input.subscribe(() => recorder.observe(input.getSnapshot().pressedMidis));
    return () => {
      unsubscribe();
      recorder.stop();
    };
  }, [input, recorder]);
  return { recorder, recording: snapshot };
}

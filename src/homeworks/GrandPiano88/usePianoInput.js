import { useEffect, useState, useSyncExternalStore } from "react";
import { createPianoInput } from "./pianoInput.js";

export function usePianoInput(createSynth) {
  // Factory is a mount-time dependency; construction creates no audio context.
  const [input] = useState(() => createPianoInput({ createSynth }));
  const snapshot = useSyncExternalStore(input.subscribe, input.getSnapshot, input.getServerSnapshot);
  useEffect(() => input.attach(window), [input]);
  return { input, snapshot };
}

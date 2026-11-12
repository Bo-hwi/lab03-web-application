import { useCallback, useEffect, useRef, useState } from "react";
import { createDrumSynth } from "../../audio/drumSynth.js";
import { DRUM_PADS } from "../../data/drumPads.js";
import { useDrumKeyboard } from "../../hooks/useDrumKeyboard.js";
import { DecibelMeter } from "./DecibelMeter.jsx";
import { DrumPad } from "./DrumPad.jsx";
import { HitLog } from "./HitLog.jsx";
import styles from "./DrumMachine.module.css";

const PAD_MAP = new Map(DRUM_PADS.map((pad) => [pad.code, pad]));

export function DrumMachine() {
  const engineRef = useRef(null);
  const mountedRef = useRef(false);
  const meterTimerRef = useRef(null);
  const clickTimerRef = useRef(null);
  const nextHitIdRef = useRef(0);
  const [hits, setHits] = useState([]);
  const [level, setLevel] = useState(0);
  const [pointerHeld, setPointerHeld] = useState([]);
  const [clickedPadId, setClickedPadId] = useState(null);
  const [audioError, setAudioError] = useState("");

  useEffect(() => {
    mountedRef.current = true;
    const engine = createDrumSynth();
    engineRef.current = engine;
    return () => {
      mountedRef.current = false;
      engineRef.current = null;
      if (meterTimerRef.current !== null) window.clearTimeout(meterTimerRef.current);
      if (clickTimerRef.current !== null) window.clearTimeout(clickTimerRef.current);
      void engine.dispose().catch(() => {});
    };
  }, []);

  const triggerPad = useCallback((pad) => {
    const id = ++nextHitIdRef.current;
    setHits((current) => [{ id, label: pad.label, key: pad.key }, ...current].slice(0, 8));
    setLevel(pad.synth.gain);
    if (meterTimerRef.current !== null) window.clearTimeout(meterTimerRef.current);
    meterTimerRef.current = window.setTimeout(() => setLevel(0), 250);
    const engine = engineRef.current;
    if (engine) {
      void engine.play(pad).then(() => {
        if (mountedRef.current) setAudioError("");
      }).catch((error) => {
        if (mountedRef.current) setAudioError(error.message || "Audio could not start.");
      });
    }
  }, []);

  const heldPadIds = useDrumKeyboard(PAD_MAP, triggerPad);
  const pressPointer = useCallback((pad, pointerId) => {
    setPointerHeld((current) => current.some((entry) => entry.pointerId === pointerId)
      ? current : [...current, { pointerId, padId: pad.id }]);
    triggerPad(pad);
  }, [triggerPad]);
  const releasePointer = useCallback((pointerId) => {
    setPointerHeld((current) => current.filter((entry) => entry.pointerId !== pointerId));
  }, []);
  const clickFromKeyboard = useCallback((pad) => {
    triggerPad(pad);
    setClickedPadId(pad.id);
    if (clickTimerRef.current !== null) window.clearTimeout(clickTimerRef.current);
    clickTimerRef.current = window.setTimeout(() => setClickedPadId(null), 150);
  }, [triggerPad]);

  return (
    <section className={styles.studio} aria-labelledby="drum-studio-title">
      <header className={styles.hero}>
        <p className={styles.eyebrow}>HW1 · Production Studio</p>
        <h2 id="drum-studio-title">Drum Kit</h2>
        <p>Play with W A S D J K L, or tap a pad. Each hit has a visible history and level.</p>
      </header>
      <ul className={styles.grid} aria-label="Drum pads">
        {DRUM_PADS.map((pad) => (
          <li key={pad.id}>
            <DrumPad
              pad={pad}
              isActive={heldPadIds.includes(pad.id) || pointerHeld.some((entry) => entry.padId === pad.id) || clickedPadId === pad.id}
              onPress={pressPointer}
              onRelease={releasePointer}
              onKeyboardClick={clickFromKeyboard}
            />
          </li>
        ))}
      </ul>
      {audioError && <p className={styles.error} role="alert">{audioError}</p>}
      <section className={styles.feedback} aria-label="Drum feedback">
        <HitLog hits={hits} />
        <DecibelMeter level={level} />
      </section>
    </section>
  );
}

import { useId } from "react";
import { PIANO_NOTES } from "./notes.js";
import { PianoKey } from "./PianoKey.jsx";
import { usePianoInput } from "./usePianoInput.js";
import styles from "./PianoKeyboard.module.css";

/** createSynth is optional mount-time dependency injection; change key to replace it. */
export function PianoKeyboard({ createSynth }) {
  const headingId = useId();
  const instructionsId = useId();
  const { input, snapshot } = usePianoInput(createSynth);
  return (
    <section className={styles.instrument} aria-labelledby={headingId}>
      <header>
        <h2 id={headingId}>88-key piano</h2>
        <p id={instructionsId}>Hold a key with a pointer, Enter or Space. Use arrow keys, Home and End to move focus. Scroll to explore A0–C8.</p>
      </header>
      {snapshot.error && <p role="alert">Audio unavailable: {snapshot.error}. Try a key again.</p>}
      <section className={styles.viewport} aria-label="Piano keys" aria-describedby={instructionsId}>
        <ul className={styles.keyboard} aria-label="88 piano notes">
          {PIANO_NOTES.map((note) => (
            <li key={note.id} className={note.isBlack ? styles.blackSlot : styles.whiteSlot}>
              <PianoKey
                note={note}
                isPressed={snapshot.pressedMidis.includes(note.midi)}
                onPress={input.press}
                onRelease={input.release}
                onTap={input.tap}
              />
            </li>
          ))}
        </ul>
      </section>
      <output role="status" aria-live="polite">{snapshot.pressedMidis.length} active notes</output>
    </section>
  );
}

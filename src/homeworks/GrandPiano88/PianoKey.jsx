import { memo } from "react";
import { MIN_PIANO_MIDI, MAX_PIANO_MIDI } from "./notes.js";
import styles from "./PianoKeyboard.module.css";

const isActivation = (event) => event.code === "Enter" || event.code === "Space";

/** Stable note entity + booleans + stable controller callbacks form the memo boundary. */
export const PianoKey = memo(function PianoKey({ note, isPressed, onPress, onRelease, onTap }) {
  const keyboardOwner = (code) => `keyboard:${note.midi}:${code}`;
  function releasePointer(event) {
    onRelease(`pointer:${event.pointerId}`);
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <button
      type="button"
      className={`${styles.key} ${note.isBlack ? styles.black : styles.white}`}
      data-midi={note.midi}
      data-note-id={note.id}
      aria-label={`Play ${note.noteName}`}
      aria-pressed={isPressed}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.focus({ preventScroll: true });
        event.currentTarget.setPointerCapture?.(event.pointerId);
        void onPress(`pointer:${event.pointerId}`, note.midi);
      }}
      onPointerUp={releasePointer}
      onPointerCancel={releasePointer}
      onPointerLeave={releasePointer}
      onPointerMove={(event) => {
        // Captured pointers may not emit pointerleave when crossing the boundary.
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom) releasePointer(event);
      }}
      onLostPointerCapture={(event) => onRelease(`pointer:${event.pointerId}`)}
      onKeyDown={(event) => {
        if (isActivation(event)) {
          event.preventDefault();
          if (!event.repeat && !event.isComposing && !event.nativeEvent?.isComposing) {
            void onPress(keyboardOwner(event.code), note.midi);
          }
          return;
        }
        const targetMidi = {
          ArrowLeft: Math.max(MIN_PIANO_MIDI, note.midi - 1),
          ArrowRight: Math.min(MAX_PIANO_MIDI, note.midi + 1),
          Home: MIN_PIANO_MIDI,
          End: MAX_PIANO_MIDI,
        }[event.code];
        if (targetMidi !== undefined) {
          event.preventDefault();
          event.currentTarget.closest("ul")?.querySelector(`[data-midi="${targetMidi}"]`)?.focus();
        }
      }}
      onKeyUp={(event) => {
        if (isActivation(event)) {
          event.preventDefault();
          onRelease(keyboardOwner(event.code));
        }
      }}
      onBlur={() => {
        onRelease(keyboardOwner("Enter"));
        onRelease(keyboardOwner("Space"));
      }}
      onClick={(event) => {
        // Pointer clicks have already played; prevented keydown owns Enter/Space.
        event.preventDefault();
        if (event.detail === 0) void onTap(note.midi);
      }}
    >
      <span>{note.noteName}</span>
      <span className={styles.stateLabel} aria-hidden="true">{isPressed ? "On" : "\u00a0"}</span>
    </button>
  );
});

import styles from "./DrumMachine.module.css";

export function DrumPad({ pad, isActive, onPress, onRelease, onKeyboardClick }) {
  return (
    <button
      type="button"
      className={styles.pad}
      data-kind={pad.synth.kind}
      aria-label={`${pad.label}, key ${pad.key}`}
      aria-pressed={isActive}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        onPress(pad, event.pointerId);
      }}
      onPointerUp={(event) => onRelease(event.pointerId)}
      onPointerCancel={(event) => onRelease(event.pointerId)}
      onLostPointerCapture={(event) => onRelease(event.pointerId)}
      onClick={(event) => { if (event.detail === 0) onKeyboardClick(pad); }}
    >
      <span className={styles.padKey}>{pad.key}</span>
      <span className={styles.padLabel}>{pad.label}</span>
    </button>
  );
}

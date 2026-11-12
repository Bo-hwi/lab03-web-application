import { useId } from "react";
import styles from "./DrumMachine.module.css";

export function DecibelMeter({ level }) {
  const meterId = useId();
  const decibels = level > 0 ? Math.max(-60, Math.round(20 * Math.log10(level))) : -60;

  return (
    <section className={styles.panel} aria-labelledby="drum-meter-title">
      <h3 id="drum-meter-title">Visual decibel meter</h3>
      <label htmlFor={meterId}>Hit level</label>
      <meter id={meterId} min="-60" max="0" low="-30" high="-6" optimum="-6" value={decibels} />
      <output className={styles.meterValue} aria-live="off">{level > 0 ? `${decibels} dB` : "Silent"}</output>
      <p className={styles.meterNote}>Visual estimate from each pad’s gain setting; not a calibrated microphone reading.</p>
    </section>
  );
}

import styles from "./DrumMachine.module.css";

export function HitLog({ hits }) {
  return (
    <section className={styles.panel} aria-labelledby="drum-hit-log-title">
      <h3 id="drum-hit-log-title">Hit history</h3>
      <output className={styles.hitStatus} aria-live="polite">
        {hits.length ? `Last hit: ${hits[0].label} (${hits[0].key}). ${hits.length} recent hits shown.` : "No hits yet. Play a pad to start."}
      </output>
      <ol className={styles.hitList}>
        {hits.map((hit) => <li key={hit.id}><kbd>{hit.key}</kbd><span>{hit.label}</span></li>)}
      </ol>
    </section>
  );
}

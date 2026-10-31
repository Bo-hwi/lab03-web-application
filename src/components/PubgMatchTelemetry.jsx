import { useEffect, useId, useState } from "react";
import { requestSquadTelemetry } from "../data/pubgTelemetry.js";
import styles from "./PubgMatchTelemetry.module.css";

export function PubgMatchTelemetry({ squadId = "te" }) {
  const headingId = useId();
  const [retryTick, setRetryTick] = useState(0);
  const [view, setView] = useState({
    status: "IDLE",
    squadId: null,
    retryTick: -1,
    data: null,
    error: null,
  });
  const displayStatus =
    view.squadId !== squadId || view.retryTick !== retryTick || view.status === "IDLE"
      ? "LOADING"
      : view.status;

  useEffect(() => {
    const controller = new AbortController();

    requestSquadTelemetry(squadId, { signal: controller.signal }).then(
      (data) => {
        if (!controller.signal.aborted) {
          setView({ status: "SUCCESS", squadId, retryTick, data, error: null });
        }
      },
      (error) => {
        if (!controller.signal.aborted && error.name !== "AbortError") {
          setView({ status: "ERROR", squadId, retryTick, data: null, error: error.message });
        }
      },
    );

    return () => controller.abort();
  }, [squadId, retryTick]);

  return (
    <section className={styles.telemetry} aria-labelledby={headingId} aria-busy={displayStatus === "LOADING"}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>PVS · Satellite feed</p>
        <h2 id={headingId}>Live squad telemetry</h2>
      </header>
      <section className={styles.stateFrame} aria-label="Telemetry state">
        {displayStatus === "LOADING" && (
          <>
            <p role="status">Connecting to satellite telemetry…</p>
            <article className={styles.skeleton} aria-hidden="true">
              <span className={styles.skeletonHeading} />
              <span className={styles.skeletonLine} />
              <span className={styles.skeletonLine} />
              <span className={styles.skeletonLineShort} />
            </article>
          </>
        )}
        {displayStatus === "ERROR" && (
          <section className={styles.error} role="alert">
            <h3>Satellite connection lost</h3>
            <p>{view.error}</p>
            <button type="button" onClick={() => setRetryTick((current) => current + 1)}>
              Reconnect Satellite (Retry)
            </button>
          </section>
        )}
        {displayStatus === "SUCCESS" && (
          <article className={styles.card}>
            <header>
              <p className={styles.eyebrow}>Live match packet</p>
              <h3>{view.data.name}</h3>
            </header>
            <dl className={styles.metrics}>
              <dt>Map</dt><dd>{view.data.map}</dd>
              <dt>Phase</dt><dd>{view.data.phase}</dd>
              <dt>Alive</dt><dd>{view.data.alive}</dd>
              <dt>Kills</dt><dd>{view.data.kills}</dd>
              <dt>WWCD probability</dt><dd>{view.data.wwcdProb}</dd>
              <dt>Status</dt><dd>{view.data.status}</dd>
            </dl>
          </article>
        )}
      </section>
    </section>
  );
}

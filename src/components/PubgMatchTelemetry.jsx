import { useEffect, useId, useState } from "react";
import { requestSquadTelemetry } from "../data/pubgTelemetry.js";

export function PubgMatchTelemetry({ squadId = "te" }) {
  const headingId = useId();
  const [view, setView] = useState({ status: "IDLE", squadId: null, data: null, error: null });
  const displayStatus = view.squadId !== squadId || view.status === "IDLE" ? "LOADING" : view.status;

  useEffect(() => {
    const controller = new AbortController();

    requestSquadTelemetry(squadId, { signal: controller.signal }).then(
      (data) => {
        if (!controller.signal.aborted) {
          setView({ status: "SUCCESS", squadId, data, error: null });
        }
      },
      (error) => {
        if (!controller.signal.aborted && error.name !== "AbortError") {
          setView({ status: "ERROR", squadId, data: null, error: error.message });
        }
      },
    );

    return () => controller.abort();
  }, [squadId]);

  return (
    <section aria-labelledby={headingId} aria-busy={displayStatus === "LOADING"}>
      <h2 id={headingId}>Live squad telemetry</h2>
      {displayStatus === "IDLE" && <p>Waiting for satellite telemetry.</p>}
      {displayStatus === "LOADING" && <p>Connecting to satellite telemetry…</p>}
      {displayStatus === "ERROR" && <p>{view.error}</p>}
      {displayStatus === "SUCCESS" && (
        <article>
          <h3>{view.data.name}</h3>
          <dl>
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
  );
}



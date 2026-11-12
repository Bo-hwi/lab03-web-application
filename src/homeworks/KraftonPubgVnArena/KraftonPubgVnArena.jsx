import { useId, useState } from "react";
import {
  createArenaDrops, DROP_TEMPLATES, formatVnd, getDropPhase, KILL_FEED,
  selectKillFeed, selectStandings, SORT_OPTIONS, SQUAD_STANDINGS,
} from "./arenaData.js";
import { useArenaClaims } from "./useArenaClaims.js";
import { usePubgAirdropTimer } from "./usePubgAirdropTimer.js";
import styles from "./KraftonPubgVnArena.module.css";

export function formatCountdown(milliseconds) {
  const seconds = Math.ceil(Math.max(0, milliseconds) / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

const phaseLabels = Object.freeze({
  WARMUP: "Incoming",
  AIRDROP_LIVE: "Live now",
  LOOTED_OUT: "Looted out",
  EXPIRED: "Expired",
});

function AirdropCard({ drop, inventory, onClaim }) {
  const { nowMs } = usePubgAirdropTimer(drop.dropEpochMs);
  const phase = getDropPhase(drop, nowMs, inventory.stock);
  const targetMs = phase === "WARMUP" ? drop.dropEpochMs : drop.expiresEpochMs;
  const countdown = formatCountdown(targetMs - nowMs);
  const canClaim = phase === "AIRDROP_LIVE" && !inventory.pending;

  return (
    <article className={styles.dropCard} aria-label={drop.title}>
      <header className={styles.dropHeader}>
        <output className={styles.phase} data-phase={phase} aria-live="polite">{phaseLabels[phase]}</output>
        <h4>{drop.title}</h4>
      </header>
      <dl className={styles.dropFacts}>
        <dt>Price</dt><dd>{formatVnd(drop.priceVnd)}</dd>
        <dt>Available</dt><dd>{inventory.stock}</dd>
      </dl>
      <output className={styles.countdown} aria-live="off" aria-label={`${phase === "WARMUP" ? "Opens" : "Ends"} in ${countdown}`}>
        {phase === "WARMUP" ? "Opens in" : "Ends in"} <strong>{countdown}</strong>
      </output>
      <button type="button" disabled={!canClaim} onClick={() => { void onClaim(drop.id); }}>
        {inventory.pending ? "Claiming…" : `Claim ${drop.title}`}
      </button>
      {inventory.message && (
        <p role={inventory.result === "conflict" || inventory.result === "error" ? "alert" : "status"}>
          {inventory.message}
        </p>
      )}
    </article>
  );
}

export function KraftonPubgVnArena() {
  const [drops] = useState(() => createArenaDrops(Date.now()));
  const { claims, claim } = useArenaClaims(drops);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("wwcdCount");
  const [feedSquad, setFeedSquad] = useState("all");
  const queryId = useId();
  const sortId = useId();
  const feedId = useId();
  const visibleStandings = selectStandings(SQUAD_STANDINGS, query, sortBy);
  const visibleFeed = selectKillFeed(KILL_FEED, feedSquad);

  return (
    <section className={styles.arena} aria-labelledby="pvs-arena-title">
      <header className={styles.hero}>
        <p className={styles.eyebrow}>KRAFTON × PUBG Vietnam</p>
        <h2 id="pvs-arena-title">PVS Finals · Airdrop Arena</h2>
        <p>Follow the championship, watch the drop clock and claim a finals reward.</p>
        <p className={styles.demoNotice}>Local demo: claims use a simulated server. A later claim can return a 409 conflict and restore the displayed stock.</p>
      </header>

      <section className={styles.panel} aria-labelledby="pvs-drops-title">
        <header className={styles.sectionHeader}>
          <h3 id="pvs-drops-title">Finals tickets & crates</h3>
          <p>{DROP_TEMPLATES.length} drops</p>
        </header>
        <ul className={styles.dropGrid}>
          {drops.map((drop) => (
            <li key={drop.id}>
              <AirdropCard drop={drop} inventory={claims.find((entry) => entry.id === drop.id)} onClaim={claim} />
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.panel} aria-labelledby="pvs-standings-title">
        <header className={styles.sectionHeader}>
          <h3 id="pvs-standings-title">Vietnam leaderboard</h3>
          <p>WWCD · placement · kills</p>
        </header>
        <section className={styles.controls} aria-label="Leaderboard filters">
          <p><label htmlFor={queryId}>Find a squad</label><input id={queryId} type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></p>
          <p><label htmlFor={sortId}>Rank by</label><select id={sortId} value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            {SORT_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select></p>
        </section>
        <output className={styles.resultCount} aria-live="polite">{visibleStandings.length} squads shown</output>
        {visibleStandings.length > 0 ? (
          <ol className={styles.standings}>
            {visibleStandings.map((squad) => (
              <li key={squad.squadId}>
                <strong>{squad.squadName}</strong>
                <dl>
                  <dt>WWCD</dt><dd>{squad.wwcdCount}</dd>
                  <dt>Placement</dt><dd>{squad.placementPts}</dd>
                  <dt>Kills</dt><dd>{squad.killPts}</dd>
                </dl>
              </li>
            ))}
          </ol>
        ) : <p>No squads match that search.</p>}
      </section>

      <section className={styles.panel} aria-labelledby="pvs-feed-title">
        <header className={styles.sectionHeader}><h3 id="pvs-feed-title">Live match kill feed</h3><p>Finals highlights</p></header>
        <p className={styles.feedControl}><label htmlFor={feedId}>Show squad</label><select id={feedId} value={feedSquad} onChange={(event) => setFeedSquad(event.target.value)}>
          <option value="all">All squads</option>
          {SQUAD_STANDINGS.map((squad) => <option key={squad.squadId} value={squad.squadId}>{squad.squadName}</option>)}
        </select></p>
        <ul className={styles.feed}>
          {visibleFeed.map((event) => (
            <li key={event.id}><span>#{event.matchMinute}&prime;</span><strong>{event.killer}</strong> eliminated {event.victim} <span>· {event.weapon}</span></li>
          ))}
        </ul>
      </section>
    </section>
  );
}

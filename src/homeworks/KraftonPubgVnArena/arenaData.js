export const DROP_TEMPLATES = Object.freeze([
  Object.freeze({ id: "pvs-vip", title: "PVS Grand Finals VIP Ticket", priceVnd: 1_200_000, remainingStock: 2, opensInMs: 0, liveForMs: 300_000 }),
  Object.freeze({ id: "gcoin-crate", title: "5,000 G-Coin Contraband Crate", priceVnd: 480_000, remainingStock: 3, opensInMs: 20_000, liveForMs: 300_000 }),
]);

export const SQUAD_STANDINGS = Object.freeze([
  Object.freeze({ squadId: "te", squadName: "The Expendables", wwcdCount: 3, placementPts: 48, killPts: 59 }),
  Object.freeze({ squadId: "ces", squadName: "Cerberus Esports", wwcdCount: 2, placementPts: 51, killPts: 46 }),
  Object.freeze({ squadId: "roy", squadName: "Roy Esports", wwcdCount: 1, placementPts: 39, killPts: 42 }),
  Object.freeze({ squadId: "agg", squadName: "AGG", wwcdCount: 2, placementPts: 44, killPts: 50 }),
]);

export const KILL_FEED = Object.freeze([
  Object.freeze({ id: "kill-1", squadId: "te", killer: "TE • Clories", victim: "CES • Taikonn", weapon: "M416", matchMinute: 28 }),
  Object.freeze({ id: "kill-2", squadId: "ces", killer: "CES • Himass", victim: "ROY • Player", weapon: "Mini14", matchMinute: 29 }),
  Object.freeze({ id: "kill-3", squadId: "agg", killer: "AGG • Zest", victim: "TE • 777", weapon: "AKM", matchMinute: 31 }),
  Object.freeze({ id: "kill-4", squadId: "roy", killer: "ROY • Player", victim: "AGG • Huy", weapon: "S12K", matchMinute: 32 }),
]);

export const SORT_OPTIONS = Object.freeze([
  Object.freeze({ id: "wwcdCount", label: "Chicken dinners" }),
  Object.freeze({ id: "placementPts", label: "Placement points" }),
  Object.freeze({ id: "killPts", label: "Kill points" }),
]);

const vndFormatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

export function formatVnd(amount) {
  if (!Number.isSafeInteger(amount) || amount < 0) throw new RangeError("VND amount must be a nonnegative integer");
  return vndFormatter.format(amount);
}

export function createArenaDrops(nowMs) {
  if (!Number.isFinite(nowMs)) throw new TypeError("nowMs must be finite");
  return Object.freeze(DROP_TEMPLATES.map((template) => Object.freeze({
    id: template.id,
    title: template.title,
    priceVnd: template.priceVnd,
    remainingStock: template.remainingStock,
    dropEpochMs: nowMs + template.opensInMs,
    expiresEpochMs: nowMs + template.opensInMs + template.liveForMs,
  })));
}

export function getDropPhase(drop, nowMs, stock = drop.remainingStock) {
  if (nowMs < drop.dropEpochMs) return "WARMUP";
  if (nowMs >= drop.expiresEpochMs) return "EXPIRED";
  if (stock <= 0) return "LOOTED_OUT";
  return "AIRDROP_LIVE";
}

export function selectStandings(standings, query = "", sortBy = "wwcdCount") {
  if (!SORT_OPTIONS.some((option) => option.id === sortBy)) throw new RangeError("Unsupported leaderboard sort");
  const search = query.trim().toLocaleLowerCase("vi-VN");
  return standings
    .filter((squad) => squad.squadName.toLocaleLowerCase("vi-VN").includes(search))
    .toSorted((a, b) => b[sortBy] - a[sortBy] || a.squadName.localeCompare(b.squadName, "vi-VN"));
}

export function selectKillFeed(feed, squadId = "all") {
  return feed.filter((event) => squadId === "all" || event.squadId === squadId);
}

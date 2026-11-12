import { useEffect, useState, useSyncExternalStore } from "react";
import { createClaimManager, createDemoClaimService } from "./claims.js";

export function useArenaClaims(drops) {
  const [manager] = useState(() => createClaimManager(drops, createDemoClaimService(drops)));
  const claims = useSyncExternalStore(manager.subscribe, manager.getSnapshot, manager.getSnapshot);

  useEffect(() => () => manager.cancelAll(), [manager]);

  return { claims, claim: manager.claim };
}

# Bonus verification

| Check | Status | Evidence |
| --- | --- | --- |
| FSM and effort math | PASS (Node) | Focused tests cover all four phases, legal transitions, stale timeout IDs, immutable log snapshots, 100 × 0.1 versus 1 × 50 and derived warning. |
| Ghost timeout, reply and cleanup | PASS (fake timer and Playwright Chromium); browser unmount PENDING | After fixing the browser timer invocation, Playwright observed the 3-second ghost transition, early reply staying in dating for another 3.2 seconds, and subsequent commitment. Browser unmount cleanup has not been measured. |
| SSR semantics and labelled controls | PASS (SSR); BROWSER PENDING | Real JSX rendered through Vite SSR: labels match `useId` fields, named status outputs, every button has `type="button"`, no `<div>` in the component. |
| 375px layout, keyboard and screen reader | PASS (Playwright Chromium layout); keyboard and screen reader PENDING | Browser measurement: `innerWidth=375`, `documentScrollWidth=375`, `bodyScrollWidth=375`; see [JSON](evidence/bonus-375.json) and [full-page screenshot](evidence/bonus-375.png). Keyboard-only and screen-reader checks remain pending. |
| Full tests, lint and production build | PASS | 2026-11-12 Windows Node v26.12.1: focused bonus 6/6, `npm.cmd test` 23/23, `npm.cmd run lint` exit 0, `npm.cmd run build` exit 0; Vite 7.3.7 built both `dist/index.html` and `dist/bonus.html`. Full suite includes preserved untracked HW1 tests and HW3 tests. |

## Browser access

- Vite served `/bonus.html` on port 5175 with HTTP 200 and the expected module entry. This is a server response, not browser interaction evidence.
- An earlier Computer-use `createBrowserTab` attempt returned `The browser access host is unavailable`. Playwright Chromium subsequently supplied independent browser measurements and screenshots. Screen-reader and Lighthouse checks remain unrun.
- On 2026-11-12, the student replied "tôi thấy đạt hết r" to the request to check the real 3-second ghost timeout, reply before timeout, phase restart/dating/stop actions, effort input, and horizontal scrolling at 375px in Chrome. This supports student-reported PASS for those requested flows only. The response did not include exact phase transcripts, timing or width measurements, browser version, screenshots, or console output. Browser unmount cleanup, keyboard-only navigation, screen reader, and Lighthouse remain unverified.
- `git diff --check` exited 0 for tracked files. It does not inspect new untracked bonus files; a separate whitespace check is required for them.

## Independent Playwright verification — 2026-11-12

- `npm.cmd run test:e2e`: exit 0, 5/5 browser tests passed across HW3 and bonus. The focused bonus run also exited 0 with 2/2 passed. Chromium version `158.0.8127.18` ran in a separate headless profile.
- At `375 × 812` CSS pixels, the bonus page measured `innerWidth=375`, `documentScrollWidth=375`, `bodyScrollWidth=375`. The measurement and actual full-page capture are saved as [bonus-375.json](evidence/bonus-375.json) and [bonus-375.png](evidence/bonus-375.png). The JSON timestamp is `2026-11-12T13:44:36.644Z`.
- The browser test clicked Send, observed the ghost exit after the real timer, restarted dating, received a reply before timeout, waited another 3.2 seconds without exit, committed, added ten effort steps, and stopped. This verifies those Chromium flows; it does not prove screen-reader announcements, unmount cleanup or Lighthouse score.
- The first browser run exposed a genuine generated-code timer defect that Node fake-timer tests missed. See [AI_FAILURE_AUDIT.md](AI_FAILURE_AUDIT.md). After correction: `npm.cmd test` 23/23, lint exit 0, build exit 0, `git diff --check` exit 0.

## Five-second slide-alignment checkpoint — 2026-11-12

The slide 31–32 ghost timeout is five seconds. The current code, focused tests and Chromium test use five seconds; older three-second observations above are historical and do not describe the current version. `npm.cmd test` passed 98/98, `npm.cmd run test:e2e` passed 8/8, lint and build exited 0. Fresh Chromium 158 at 375 × 812 CSS pixels measured `innerWidth=375`, `documentScrollWidth=375`, `bodyScrollWidth=375`: [measurement](evidence/bonus-375.json), [screenshot](evidence/bonus-375.png). Browser test observed ghost exit after the real five-second timer and no exit 5.2 seconds after an early reply. Screen reader, Lighthouse and browser unmount behavior remain pending.

## Student Lighthouse screenshot — 2026-11-12

The student supplied a Chrome DevTools screenshot showing `http://127.0.0.1:5173/bonus.html` with Lighthouse Accessibility **100** and Best Practices **96**. This is evidence for the bonus page at that URL and run only; the screenshot does not establish the main page's score. Lighthouse itself notes additional manual accessibility checks.

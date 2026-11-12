# HW3 verification

Record actual command output and browser evidence here. A passing Node test, lint or build does not prove live browser behavior.

| Check | Status | Evidence |
| --- | --- | --- |
| Drop and standing contracts | PASS (Node) | `tests/hw3-arena.test.js`: four squads, absolute drop epochs, phase boundaries, VND currency, all three rankings, immutable filtering. |
| Anti-drift and visibility resync | PASS (fake clock); BROWSER PENDING | Fake clock jumps 60 seconds between ticks and resyncs on visible `visibilitychange`; interval/listener cleanup asserted. Background-tab behavior in Chrome not yet observed. |
| Optimistic claim, duplicate lock and 409 rollback | PASS (Node); PASS (Playwright Chromium click and 409 rollback) | Immediate decrement, one request per drop, 409 rollback, parallel claims, abort, stale response and demo service tested. Browser clicked the VIP ticket twice, observed initial stock 2, first confirmation at stock 1, and 409 message with stock restored to 1. |
| Semantic SSR | PASS (SSR); BROWSER PENDING | Two typed claim buttons, labelled search/sort/feed controls, four squads and no `<div>` wrapper. SSR does not run effects or browser accessibility APIs. |
| Keyboard and screen reader | PENDING | Browser unavailable to agent; no user result yet. |
| 375px page overflow and focus | PASS (Playwright Chromium width); focus PENDING | `innerWidth=375`, `documentScrollWidth=375`, `bodyScrollWidth=375`; [JSON](evidence/hw3-375.json) and [full-page screenshot](evidence/hw3-375.png). Focus order was not checked. |
| Tests, lint and build | PASS | 2026-11-12 Windows Node v26.12.1: focused HW3 9/9, `npm.cmd test` 17/17, `npm.cmd run lint` exit 0, `npm.cmd run build` exit 0 (Vite 7.3.7, 45 modules). Full suite includes two untracked HW1 tests preserved from the previous task. |
| Lighthouse Accessibility | PENDING | No HW3 report. |

## Browser access and evidence limits

- Vite started successfully at `http://127.0.0.1:5175/` on 2026-11-12. Port 5174 was occupied, so the HW3 server uses 5175.
- Computer-use browser inventory reported `The browser access host is unavailable`; attempting to create a Chrome tab at the local page returned the same error. The only exposed native Chrome window showed an unrelated page and was not used.
- At this earlier checkpoint, no independent HW3 click, browser timer, 375px measurement or screenshot was available. The later Playwright checkpoint below supersedes those specific gaps. Background-tab wake, screen-reader, keyboard-only, and Lighthouse remain untested.
- The server-backed inventory is simulated locally because the assignment gives no API endpoint. A successful simulated claim is evidence for UI/control logic, not a real purchase, ticket fulfillment or remote inventory transaction.

## Student-assisted browser report — 2026-11-12

The student reported that every requested Chrome check passed at `http://127.0.0.1:5175/`: two VIP claims and stock/messages, crate opening after approximately 20 seconds, leaderboard and kill-feed filtering/sorting, and the 375px horizontal-scroll check. This is a user report without copied measurements, screenshot, browser version or exact stock transcript. It supports a student-reported PASS for those workflows; the agent did not independently observe them and Lighthouse, screen reader, and background-tab wake remain untested.

## Failure audit checkpoint

The first focused run had 6 pass and 1 SSR failure: a generated generic `<div>` grouped the leaderboard filters. Replacing it with a named section produced 7/7 on rerun and 9/9 after additional clock/race tests. See AI_FAILURE_AUDIT.md. No other generated failure was observed; the HW3 audit currently has one finding and a gap of two against a three-bug target.

## Independent Playwright verification — 2026-11-12

- `npm.cmd run test:e2e`: exit 0, 5/5 browser tests passed across HW3 and bonus. Chromium version `158.0.8127.18` ran headlessly in a separate profile.
- At `375 × 812` CSS pixels, the full App page measured `innerWidth=375`, `documentScrollWidth=375`, `bodyScrollWidth=375`. Actual evidence: [hw3-375.json](evidence/hw3-375.json), timestamp `2026-11-12T13:44:36.910Z`, and [hw3-375.png](evidence/hw3-375.png). The page emitted no uncaught `pageerror` during the layout capture.
- Browser clicks verified VIP stock `2 → 1` on success, then a simulated 409 conflict and restoration to `1`. Leaderboard search for Cerberus yielded one squad; kill-feed selection for CES yielded one event. The crate changed from `WARMUP` to `AIRDROP_LIVE` after its real approximately 20-second countdown, and its claim button became enabled.
- Visual review of the full-page image found the older Scientist Directory exercise controls crowded together at 375px, despite no horizontal page overflow. This is an observed layout concern on the shared App page; the HW3 arena section itself remains readable. Keyboard focus, screen reader, background-tab wake, and Lighthouse still need separate verification.
- After the bonus timer correction, `npm.cmd test` passed 23/23, lint and build exited 0, and `git diff --check` exited 0. These commands test the active `hw3` checkout, not the separate `hw2` branch.

## Integrated slide-alignment checkpoint — 2026-11-12

The current uncommitted `hw3` working tree also renders HW1 and HW2. Squad data now uses Roy Esports per slide 29 prose while the earlier in-class exercise retains Genius Esports per slide 22. `npm.cmd test` passed 98/98, `npm.cmd run test:e2e` passed 8/8, lint and build exited 0. Fresh Chromium 158 evidence at 375 × 812 CSS pixels measured `innerWidth=375`, `documentScrollWidth=375`, `bodyScrollWidth=375`: [measurement](evidence/hw3-375.json), [screenshot](evidence/hw3-375.png). The claim/409 and real 20-second crate tests passed again. Lighthouse, background-tab wake, screen reader and the slide 30 request for three genuine HW3 AI bugs remain open; only one real generated HW3 bug has been recorded.

## Student manual report and remaining background check — 2026-11-12

The student reported Lighthouse Accessibility 100 on the main integrated page and that the requested keyboard/accessibility controls worked. No main-page Lighthouse screenshot or screen-reader transcript was supplied in this message. The HW3 background-tab countdown check has not yet been reported; the student requested the page location. HW3 is the final section of the main `/` page, not a separate route.

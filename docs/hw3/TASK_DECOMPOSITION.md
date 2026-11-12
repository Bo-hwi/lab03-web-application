# HW3 — KRAFTON PUBG Vietnam Championship & Airdrop Arena

Source: Lab 3 PDF slides 29–30; global React, accessibility, audit and commit rules on slides 3, 8, 25 and 34. Branch `hw3` starts from `ex3` at `4195b26ed903ecffdfdfa5b20f4ed1ca70e0fe4d`.

| Task | Contract and scope | Acceptance and verification | Proposed student commit |
| --- | --- | --- | --- |
| H3-T1 | Immutable drop, standing and kill-feed data; VND formatting; pure filter/sort and phase functions | Four named squads, stable IDs, deterministic sort and phase boundaries; Node tests | `feat(hw3): define PUBG arena data contracts` |
| H3-T2 | `usePubgAirdropTimer(targetEpochMs, serverOffsetMs)` using wall-clock deltas, 200ms sync and visibility wake | No cumulative tick subtraction; effect clears interval and listener; fake-clock tests plus browser background/resume | `feat(hw3): add resyncing airdrop timer` |
| H3-T3 | Optimistic ticket/crate claim with synchronous per-drop in-flight lock, server status handling and 409 rollback | One pending claim per drop, immediate stock decrement, exact rollback, no stale update after unmount; controlled async tests | `feat(hw3): implement optimistic claim rollback` |
| H3-T4 | Semantic arena UI with tickets, crates, leaderboard and kill-feed filters | Named controls, immutable derived lists, responsive 375px, keyboard and screen-reader review | `feat(hw3): build championship airdrop arena` |
| H3-T5 | Final regression, browser verification and AI failure audit | Tests/lint/build plus real countdown, claim and responsive observations; document genuine failures only | `docs(hw3): record verified arena results` |

## Decisions where the PDF leaves implementation open

- No arena backend is present. The integrated page uses an explicitly labelled local claim simulation. It deliberately has less authoritative stock than initially displayed so a later claim returns 409 and exercises rollback. The claim service is injectable for tests and later API integration.
- A drop opens at `dropEpochMs` and expires at `expiresEpochMs`; expiry is an added domain field needed to distinguish AIRDROP_LIVE from EXPIRED. Initial demo times are relative to page mount so the interaction can be tried locally.
- `serverOffsetMs` is added to `Date.now()`; the UI treats the returned time as server-aligned time. The offset source is unspecified in the PDF and defaults to zero.
- Standings and kill-feed records are local demo data because no live feed endpoint or payload is provided. Sorting uses WWCD, placement points or kill points with a name tie-breaker.
- No AI failure is counted until a reproducible generated-code failure is actually observed. No agent Git commit is permitted under the current AGENTS.md.

## Implementation checkpoint — 2026-11-12

- H3-T1 through H3-T4 are implemented in the working tree. The timer uses a wall-clock delta and visibility resync; the claim store uses a per-drop in-flight lock and restores local stock on 409; the arena is integrated in `src/App.jsx`.
- H3-T5 automated checks are complete: 9/9 focused HW3 tests, 17/17 full suite tests, lint and build passed on Windows. The full suite includes two preserved untracked HW1 tests.
- Browser interaction, background-tab wake, real 375px layout, keyboard/screen reader and Lighthouse evidence remain pending because the browser access host is unavailable. No browser PASS is inferred from SSR or build.
- The one observed generated-code failure is documented in AI_FAILURE_AUDIT.md. Following the student's explicit commit request, HW3 code and tests were committed as `a9f3612` on `hw3`.

# HW2 AI Failure Audit

## Current evidence

Prepared 2026-11-11 (Asia/Saigon); updated after the approved H2-T3 implementation and audit checkpoint.
Verified, reproducible HW2 AI-generated failures recorded: **3** (updated 2026-11-11 afternoon), all in test infrastructure (Vite test setup and the browser-gate harness); no piano product failure has been demonstrated.
Evidence gap against a three-failure target: **0** overall. If the instructor requires product failures exclusively, that narrower count is still 0; do not misrepresent the category.
Historical HW1/Exercise findings and defects in assignment reference code are not automatically HW2 AI failures.

## Recording policy

Slides 25/34 require forensic AI failure evidence. After every H2-T1 through H2-T7 implementation task, review the generated change and update this audit checkpoint even if zero failures occurred.

- Log only an AI-generated implementation or test defect that actually occurred and can be reproduced.
- Keep hypothetical hazards in TASK_DECOMPOSITION.md; do not count them as observed failures.
- Never deliberately introduce defects to reach the target, duplicate one failure as multiple findings, or copy PDF example commit hashes.
- Distinguish assistant/tool invocation mistakes from HW2 product failures.
- Keep original evidence and state whether the issue is open, corrected or awaiting browser verification.
- A passing mock test does not establish audible output, keyboard/screen-reader behavior or Profiler isolation.
- If fewer than three genuine failures occur, report the actual count and evidence gap explicitly at submission.
- Never run git commit. Record a fix hash only after the student creates a real commit and it is verified; otherwise write pending student commit.

## Required fields for each genuine failure

When an actual failure is observed, append a numbered entry containing:

1. Task ID, date/timezone, environment, affected requirement and provenance (the real prompt and AI output/version).
2. Exact affected file and code context, expected behavior and actual behavior.
3. Minimal reproducible steps, input/timing and relevant initial state.
4. Real proof: command plus exit/output, browser/console/Network/Profiler evidence or screenshot/report path if actually captured.
5. Root cause and bounded impact; distinguish confirmed cause from inference.
6. Engineering correction and meaningful regression check, with actual rerun result and remaining manual gaps.
7. Fix commit: pending student commit until a real verified hash exists.

No fabricated example failure is prefilled.

## Checkpoint register

| Task | Review state | New verified failures | Evidence / notes |
| --- | --- | --- | --- |
| H2-T1 | SENIOR APPROVED in H2-T2 instruction | 0 | 13/13 focused tests, 19/19 full suite; lint/build/diff checks exit 0; implementation cb5512afa9e7c722bd7b270a6d7dd084c8794841 |
| H2-T2 | SENIOR APPROVED in H2-T3 instruction | 0 | 23/23 focused tests, 42/42 full suite; lint/build/diff checks exit 0; implementation c52d471ef07efbe0bff6277af1d983c6013f10ce |
| H2-T3 | REVIEWED - awaiting Senior Review | 1 test-infrastructure finding | Final focused 20/20, full 62/62, lint/build/diff checks exit 0; implementation 524404ad9570a1fb5a96bb49cef3013e7e45f3c3 |
| H2-T4 | NOT STARTED | Not assessed | No implementation |
| H2-T5 | NOT STARTED | Not assessed | No implementation |
| H2-T6 | NOT STARTED | Not assessed | No implementation |
| H2-T7 | NOT STARTED | Not assessed | No implementation |

## Reference risks excluded from the failure count

Slide 28's standalone PolyphonicSynth calls noteOff without defining it; slide 27's sample PianoKey only handles pointer down/up. These are source-audit findings, not observed failures generated while implementing this homework. They motivate tests but do not satisfy the AI failure quota.

## H2-T1 checkpoint - 2026-11-11 (Asia/Saigon)

- Task instruction: approved pure note generation and recording timeline contracts, focused tests, required verification and separate commits. No recorder, audio engine or React component requested or added.
- Reviewed implementation `cb5512afa9e7c722bd7b270a6d7dd084c8794841`, its two focused test files and the actual tool results recorded in VERIFICATION.md.
- All 13 focused tests passed on the first execution; full suite 19/19, lint/build and staged/working diff checks exited 0. No genuine reproducible AI-generated implementation/test failure was observed in this task. No failure entry or invented fix hash is added.
- Vite's dependency re-optimization notice and Git's LF/CRLF conversion warnings are tool notices, not demonstrated product failures.
- Browser/audio/Profiler checks remain not performed. Future recording engine behavior is not claimed from a data-contract fixture.
- Current verified failure count remains 0; gap against the three-failure target remains 3. Do not manufacture failures to close it.
- This audit checkpoint is an actual documentation change, committed separately under the explicitly approved HW2 policy. The earlier manual-commit wording above is historical and superseded by AGENTS.md/project-rules.md; all hashes reported for this task are read from Git after successful commits.

## H2-T2 checkpoint - 2026-11-11 (Asia/Saigon)

- Prompt/provenance: student's attached H2-T2 instruction approved a standalone audio engine, all fifteen minimum deterministic scenarios and separate verified commits; H2-T3 expressly excluded.
- Reviewed implementation `c52d471ef07efbe0bff6277af1d983c6013f10ce`, its mock helper, tests and real command results in VERIFICATION.md.
- First focused run: 23 passed, 0 failed. Full suite: 42 passed, 0 failed. Lint/build/diff checks exited 0. No genuine reproducible AI-generated implementation or test failure was observed in this task, so no numbered failure or fabricated correction is added.
- Resume/initialization/allocation/close rejections in tests are deliberately injected external failures exercising successful error handling; they are not bugs observed in the generated implementation and do not count toward the quota.
- FIFO ownership, cleanup, concurrent startup/disposal and gain staging were reviewed/tested with mocks. Browser audio, hardware output, clipping/click measurements and GC/resource profiling were not performed; these remain verification gaps rather than asserted failures.
- Verified HW2 failure total remains 0; gap against three remains 3. Reference-slide omissions and Git line-ending warnings remain excluded.
- This is a real zero-failure checkpoint update and is committed separately under the approved policy, without creating an empty commit or inventing a failure to justify it.

## Failure #01 - Unnecessary SSR WebSocket listener collided with another Vite server

- Task/date: H2-T3, 2026-11-11 (Asia/Saigon), Windows, Node v26.12.1, Vite 7.3.7.
- Provenance: student requested focused tests using existing tooling without new dependencies. AI generated tests/hw2-keyboard.test.js with the initial uncommitted line `createServer({ server: { middlewareMode: true }, appType: "custom" })`, following the older DeveloperCard SSR test pattern without isolating network listeners.
- Expected: SSR transformation/render tests should not compete for a shared WebSocket port.
- Observed proof: the full `npm.cmd test` run during concurrent focused/full verification and a fixture dev-server session emitted the exact diagnostic `WebSocket server error: Port 24678 is already in use`. It still exited 0 with 62 passed, 0 failed. This was an observed test setup error, not a failing assertion or an audible piano defect.
- Reproduction: use the initial configuration for the new SSR suite while another middleware-mode Vite instance owns its default HMR port (the existing DeveloperCard suite also creates a Vite instance); run the new/full tests concurrently. The unneeded listener attempts to bind the occupied port. No intentionally defective product code was introduced for audit evidence.
- Cause: middleware mode does not by itself disable Vite WebSocket startup. Installed Vite config.js createWebSocketServer explicitly skips listener setup for server.ws===false. The new test needed transforms, not HMR/network access.
- Correction: configure the new suite with `server: { middlewareMode: true, ws: false, hmr: false }`; leave existing unrelated tests unchanged and retain after-hook server.close().
- Fix commit: `524404ad9570a1fb5a96bb49cef3013e7e45f3c3` (contains implementation, tests and this pre-commit correction).
- Regression evidence: reran focused tests 20/20, full suite 62/62, lint/build/diff checks exit 0. Final full-suite output no longer contained the WebSocket diagnostic. No browser pass is implied.
- Impact/category: low-severity generated test-infrastructure defect; scope is listener/resource isolation and noisy diagnostics. Do not relabel it as FIFO, ownership, rendering or accessibility failure.

## H2-T3 checkpoint and evidence gaps

- Input ownership, pending token races, repeated activation, blur/unmount cleanup and SSR semantics were tested. No reproducible product defect was observed in those checks; no additional numbered failures added.
- Browser host was unavailable; native fallback ended because computer-use could not safely determine Chrome's URL. This tooling blocker is not a generated piano bug and is excluded from the failure count.
- Real DOM dispatch, client React effect lifecycle, empirical memo isolation, physical sound, focus/375px layout, screen reader and Lighthouse remain pending. Code/SSR/mocks do not fill these gaps.
- Current count: one genuine test-infrastructure failure, two short of three overall; zero demonstrated product failures. H2-T4 NOT STARTED; stop for Senior Review.

## Failure #02 - Browser-gate pointercancel was dispatched before the press it was meant to cancel

- Task/date: H2-T3 browser gate, 2026-11-11 (Asia/Saigon), Claude desktop browser pane (Electron Chromium 156), Vite 7.3.7.
- Provenance: AI-written test harness `tests/piano-browser-gate.jsx` ("Cancel next real pointer press"). Original code in the document capture listener: `queueMicrotask(() => target.dispatchEvent(new PointerEvent("pointercancel", ...)))`.
- Expected: the cancel reaches the key while it is pressed and releases it before pointerup.
- Observed proof (agent-06 beforeFix, 07:39:12Z): pointercancel logged with `pressedBefore []` then `pressedAfter [24]`; the key stayed pressed until the real pointerup. The microtask ran after the capture listener and before React's root pointerdown handler, so the cancel preceded the press and the check could never fail.
- Correction: dispatch the cancel from a 30 ms timer tracked in the effect's timer set (cleared on cleanup). Re-run (agent-06 afterFix, 07:40:38Z): cancel arrives with `pressedBefore [24]`, `pressedAfter []`, released before pointerup.
- Fix commit: `d341aaa1d5853d787db6b465e248a9ede1a1ee8c` - `test(hw2): add real-browser gate harness for piano keyboard` (verified in git log, 2026-11-12).
- Impact/category: test harness defect that made a verification check vacuous. Not a PianoKey defect.

## Failure #03 - Browser-gate A02 audio check sampled once at a fixed delay and failed on a cold AudioContext

- Task/date: H2-T3 browser gate, 2026-11-11 (Asia/Saigon), same environment.
- Provenance: AI-written harness check A02: `await wait()` (80 ms) then a single `rms(...)` sample, asserting signal > 0.00001.
- Expected: detect the first note's output whenever the note actually sounds.
- Observed proof (agent-09, 07:41:55Z, fresh load at 375x812): A02 FAIL with rms 0 while A01 showed a new running context. Agent probe with the real PolyphonicSynth: a fresh context reported `running` with currentTime 0; first non-zero RMS appeared ~64 ms after noteOn, stable from ~175 ms. Earlier PASS runs had a warm context (contextsBeforeGesture 1), which hid the race.
- Correction: `waitForSignal()` polls every 20 ms for up to 600 ms (also used by "Measure Stop and dispose"). Re-run (agent-10, 07:44:04Z, cold context): A02 PASS, rms 0.0305, waitedMs 220.
- Fix commit: `d341aaa1d5853d787db6b465e248a9ede1a1ee8c` - `test(hw2): add real-browser gate harness for piano keyboard` (verified in git log, 2026-11-12).
- Impact/category: flaky, timing-dependent test defect. It also revealed ~300 ms first-note latency on a cold context in this environment (recorded as a UX observation, not fixed).

## H2-T4 to H2-T7 checkpoint - 2026-11-11

- Recording, replay and integration were generated by the agent and checked with 17 new tests plus agent browser runs (agent-13, agent-14). No reproducible product defect was observed in those checks, so no failure entry was added for them.
- One self-corrected slip before any run: the first draft keyed speed `<option>` elements on the primitive speed value, which project rules forbid; replaced with frozen option entities before tests ran. Not counted as a failure (no runtime evidence).

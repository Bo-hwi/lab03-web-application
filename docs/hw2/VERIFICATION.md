# HW2 Verification

## Evidence rules

Prepared 2026-11-11 (Asia/Saigon); updated after the approved H2-T3 implementation and verification.
H2-T1 through H2-T3 automated results are recorded below. No browser, physical audio, Lighthouse or React Profiler PASS is claimed.
Historical Exercise/HW1 results do not verify HW2. Every implementation task must pass through the checkpoint in TASK_DECOMPOSITION.md.

Use PENDING, BLOCKED, NOT APPLICABLE, PASS or FAIL precisely. PASS requires an actual observation within the stated scope. Record command, exit code/output, environment, date, task ID and evidence location. Mocks cannot verify audible output, screen-reader behavior or real React rendering isolation.

## Planning safety baseline

- Starting branch: hw1/drum-kit; starting HEAD: 4195b26ed903ecffdfdfa5b20f4ed1ca70e0fe4d.
- ex3 points to the same commit; main is older at e65fff3. No hw2 branch existed at initial inspection.
- No tracked staged/unstaged changes initially. PDF and three docs/hw1 files were untracked.
- Student confirms HW1 complete; this checkout does not expose its Drum Kit implementation. Preserve current files and do not redo HW1.
- Read AGENTS.md/project-rules.md; agent commits forbidden. No policy changes.
- PDF text re-read for slides 3, 8, 25, 27, 28, 34; disk bytes matched the previously read 35-page PDF. No visual PDF rendering in this phase.
- Branch preparation is documentation-only. Final branch/file preservation results are reported in the chat after the files are written; they are not assumed here.

## Planned verification matrix

| ID | Area / Tasks | Automated verification | Manual browser verification | Expected | Result / evidence |
| --- | --- | --- | --- | --- | --- |
| V01 | Notes/contracts T1 | MIDI range, uniqueness, 88/52/36 split, color cycle, endpoint names, A4/formula/tolerance tests | No UI yet; browser NOT APPLICABLE | Correct algorithmic immutable notes and explicit timeline | PASS automated: 13 focused tests; see H2-T1 evidence |
| V02 | FIFO voices T2 | Fake AudioContext eight/nine voices, oldest-first steal, repeated MIDI ownership and reinsert order | Hear chords/steal once UI exists | Max eight active voices under approved tail policy | PASS mocks; real browser PENDING integration |
| V03 | Envelope/disposal T2 | Positive ramp floor, ADSR scheduling, 40ms release, stop/disconnect, stale onended and dispose race | Listen for pops/clipping; inspect real context behavior | Controlled musical release and no leaked audio resources | PASS mocks; physical audio PENDING integration |
| V04 | Audio startup T2/T6 | Suspended resume success/rejection, disposal during resume, lazy creation | First gesture unlock, suspended context and failure UI | No render-time context side effects or late audio | PASS mocks; actual autoplay/resume PENDING |
| V05 | Input lifecycle T3 | Down/up, repeat, multi-source ownership, pointercancel/lost capture, blur | Keyboard, IME where available, touch chords, drag-out release | Correct release and no stuck/duplicate notes | PASS controller/handler tests; browser PENDING; no global letter shortcuts |
| V06 | Key semantics T3/T6 | Actual component SSR/handler checks, 88 stable identities, named buttons and explicit type | All notes keyboard reachable; Enter/Space; focus navigation | Accessible generated 88-key instrument | PASS SSR and handler wiring; real focus/keyboard PENDING |
| V07 | Recording T4 | Monotonic fake-clock traces, deltas/durations, reversed releases, Stop finalization, immutability/bounds | Record chord/rest/repeated notes and inspect sequence | FIFO onset order with preserved overlaps | PENDING |
| V08 | Replay T5 | 0.5/1/2 scaling of deltas and durations, overlap and empty queue | Hear phrase at all speeds; background/wake | Correct tempo without serializing chord durations | PENDING |
| V09 | Stop/races T5 | Abort before/during waits and resume; Play-Stop-Play; stale note-off; cleanup counts | Stop during sound/rest/startup; quick restart | Immediate session invalidation/silence, no later sound or unhandled rejection | PENDING |
| V10 | Render isolation T3/T7 | Prop identity review; tests only as supporting evidence | React DevTools Profiler after settled mount, normal press/release and steal separately | Only affected PianoKey components commit updates; distinguish StrictMode | PENDING - actual Profiler required |
| V11 | Accessibility T3/T6/T7 | Semantic/label/name review; automated audit when available | Keyboard-only, focus visibility, screen reader, contrast, reduced motion | WCAG 2.2 AA review and Lighthouse A11y 100 | PENDING - Lighthouse alone insufficient |
| V12 | Effects/resources T2/T5/T6 | Setup-cleanup-remount; honest deps; timers/listeners/voices/context/promise cleanup | Repeated mount/unmount under StrictMode; inspect console/resources | No retained external resources or late playback | PENDING |
| V13 | Responsive T6 | Layout assertions if browser tooling available | 375/1440px, zoom, long text, keyboard focus inside contained viewport | document.scrollWidth <= viewport width; all keys reachable | PENDING |
| V14 | React/toolchain T1-T7 | Relevant tests plus npm run build, npm run lint; forbidden-pattern contextual review | Console and integrated workflows | React 19/Vite/JSX/CSS Modules; no prohibited patterns | PENDING |
| V15 | Git/audit T1-T7 | git diff --check; diff/branch/import review; student hashes checked when present | Senior evidence review | Task-to-evidence-to-commit links; HW1 preserved; no fabricated failures | PENDING |

## Task checkpoint log

After every implementation task append: task ID, requirement IDs, date/environment, commands and actual results, manual evidence or blocking reason, newly observed genuine AI failures, remaining issues, senior review outcome and student commit hash (pending until it exists).

| Task | Automated evidence | Manual evidence | Audit checkpoint | Review / real commit |
| --- | --- | --- | --- | --- |
| H2-T1 | PASS: focused 13/13, full 19/19, lint/build/diff checks exit 0 | NOT APPLICABLE: no UI/audio; future T3/T6/T7 checks | Reviewed, zero observed failures; see AI_FAILURE_AUDIT.md | Senior approved in H2-T2 instruction / cb5512afa9e7c722bd7b270a6d7dd084c8794841 |
| H2-T2 | PASS: focused 23/23, full 42/42, lint/build/diff checks exit 0 | NOT RUN; browser access blocked in T3 | Reviewed; zero observed failures | Senior approved in H2-T3 instruction / c52d471ef07efbe0bff6277af1d983c6013f10ce |
| H2-T3 | PASS final: focused 20/20, full 62/62, lint/build/diff checks exit 0 | PENDING: browser host unavailable; native browser policy binding stopped | One observed SSR test-infrastructure failure corrected; see audit | Awaiting Senior Review / 524404ad9570a1fb5a96bb49cef3013e7e45f3c3 |
| H2-T4 | NOT RUN | NOT RUN | NOT STARTED | PENDING / no commit |
| H2-T5 | NOT RUN | NOT RUN | NOT STARTED | PENDING / no commit |
| H2-T6 | NOT RUN | NOT RUN | NOT STARTED | PENDING / no commit |
| H2-T7 | NOT RUN | NOT RUN | NOT STARTED | PENDING / no commit |

## Known coverage limitation inherited from base

tests/developer.test.js imports src/exercises/DeveloperCard.jsx, while src/App.jsx imports src/components/DeveloperCard.jsx. Do not use those tests as proof for the current DeveloperCard or HW2. Tests added for HW2 must target the actual HW2 modules. A passing existing telemetry suite proves only its service checks, not piano behavior.

## H2-T1 actual evidence - 2026-11-11 (Asia/Saigon)

### Environment and provenance

- Branch: hw2. Node v26.12.1, npm 11.20.0, Vite 7.3.7; Windows PowerShell in repository root.
- Policy reviewed, staged by explicit paths and committed as `2083657f60b84a54608a2d5d89430a595d1584e3` (`chore(hw2): authorize verified task auto-commits`).
- Implementation: `cb5512afa9e7c722bd7b270a6d7dd084c8794841` (`feat(hw2): define piano notes and sequence timing contracts`). Staged file list and full staged diff inspected before commit; only the two new modules and two focused test files were included.
- PDF slides 27-28 re-read. Approved task instruction supplies the performance.now(), delta, held-note Stop and deterministic tie-order rules.

### Commands actually executed

| Command | Actual result | Scope |
| --- | --- | --- |
| `node --test tests/hw2-notes.test.js tests/hw2-contracts.test.js` | Exit 0; 13 passed, 0 failed, 0 skipped | Five note-domain tests and eight event/timeline-contract tests |
| `npm.cmd test` | Exit 0; 19 passed, 0 failed, 0 skipped | npm test script: node --test; six existing tests plus 13 new tests |
| `npm.cmd run lint` | Exit 0; no diagnostics | npm run lint script: eslint src vite.config.js; includes the new source modules, not test files |
| `npm.cmd run build` | Exit 0; Vite 7.3.7 built 39 modules in 1.16s | Current app build; H2-T1 modules are not yet imported by App, so focused Node tests verify those modules directly |
| `git diff --check` | Exit 0 | Tracked working diff; initially new files were untracked, so the staged check below also verified them |
| `git diff --cached --check` | Exit 0 before implementation commit | All four staged H2-T1 files, following explicit-path staging and full diff review |

The test run emitted a Vite dependency re-optimization notice; it was informational and all tests passed. No mandatory check failed. Build outputs and Vite caches are ignored/generated files and were not staged.

### What was verified

- MIDI range 21-108 with all 88 integers present exactly once; 52 white/36 black keys and correct black pitch classes.
- Names A0/A4/C8 and independent reference frequencies 27.5/440/4186.009044809578 Hz, plus formula and octave ratio checks.
- Stable MIDI-derived IDs across fresh generations; frozen arrays/entities without mutating caller data.
- Exactly four event fields, JSON round-trip, MIDI/frequency consistency and finite non-negative durations/deltas. Reject missing/extra fields, invalid MIDI, mismatched frequency, strings, NaN and infinities; accept zero duration/delta.
- Pure onset ordering by noteOnMs then unique onsetOrder; shuffled input gives identical results; no input mutation. Invalid clocks, pre-start timestamps and duplicate/unsafe ordinals are rejected.
- Contract fixture verifies initial silence, zero-delta chord onset and overlapping durations, including the held-note Stop rule as a documented timing fixture. It does not execute a recorder or prove future Stop behavior.

### Explicit limits and next review

- No browser, audible audio, Lighthouse, responsive layout, screen reader, React Profiler or runtime effect cleanup was tested in T1; no related feature exists yet.
- performance.now() acquisition, event accumulation/finalization and replay are contracts for T4/T5, not implemented engines. No React or Web Audio dependency in the new modules.
- Existing DeveloperCard coverage mismatch remains unchanged and outside this task.
- HW1 and unrelated untracked files were not staged; no push, reset or destructive Git action occurred.
- H2-T1 implementation complete, verification passed, awaiting Senior Review. Do not start H2-T2.

## H2-T2 actual evidence - 2026-11-11 (Asia/Saigon)

### Safety, scope and provenance

- Preflight matched previous handoff: hw2 at 67d767d; H2-T1 commits cb5512a, 2bcba16, 67d767d present; no tracked changes or staged work. Existing five untracked files left untouched and never staged.
- Read both policy files, HW2 plans/verification/audit, H2-T1 source/tests and PDF slides 27-28. User explicitly approved H2-T1 and authorized H2-T2 only.
- Implementation: `c52d471ef07efbe0bff6277af1d983c6013f10ce` (`feat(hw2): implement FIFO polyphonic audio engine`). Only PolyphonicSynth.js, mockAudio.js and hw2-synth.test.js were staged with explicit paths. Inspected full staged diff and list before commit.
- Same Node v26.12.1 / npm 11.20.0 / Vite 7.3.7 environment and repository root as T1. No package or App/React changes.

### Required commands and actual results

| Command | Actual result | Scope |
| --- | --- | --- |
| `node --test tests/hw2-synth.test.js` | Exit 0; 23 passed, 0 failed/skipped | All fifteen numbered scenarios plus eight lifecycle/ownership/overload cases |
| `npm.cmd test` | Exit 0; 42 passed, 0 failed/skipped | 19 existing + 23 new Node tests; no unhandled rejection reported by test runner |
| `npm.cmd run lint` | Exit 0; no diagnostics | Includes new engine source; test helpers are outside current lint script scope |
| `npm.cmd run build` | Exit 0; 39 modules, built in 1.52s | Existing app build, not an integrated audio instrument; new standalone module imported/tested directly by Node |
| `git diff --check` | Exit 0 | Tracked working diff; staged check below covers new files |
| `git diff --cached --check` | Exit 0 before implementation commit | Three explicitly staged source/test files, full staged diff inspected |

### Scenario coverage

- T2-01: no voices/nodes/context created at construction.
- T2-02: MIDI frequency mapping, lazy startup and suspended-context resume.
- T2-03/T2-04/T2-05: eight notes; ninth steals oldest; FIFO after release/insertion.
- T2-06/T2-07/T2-08: token-specific release; duplicate/invalid release safety; deterministic same-MIDI retrigger.
- T2-09: attack 5ms, decay 80ms, sustain 0.65, exponential release to 0.0001 over 40ms and stop schedule.
- T2-10/T2-11/T2-12: end callback disconnection; synchronous active/tail silence and async context closure; repeated/concurrent disposal.
- T2-13/T2-14: resume rejection/retry; stolen token and stale ended callback cannot affect newer voice.
- T2-15: 100-note burst, <=8 active, <=8 tails, <=16 connected sounding paths in the mock; conservative peak bound <=0.8.
- Extra cases: release during attack/decay; dispose during pending resume; stopAll during resume with a newer generation; concurrent FIFO admissions sharing resume; initialization and invalid-MIDI errors; partial allocation cleanup; rejected close with safe retry; foreign-engine token isolation.

### Source lifecycle review and limits

- Context belongs exclusively to engine; no render-time creation. No JS timers or UI listeners to leak. Map entries removed on release/end/Stop; old callbacks guard token ownership. End callbacks detached and oscillator/gain disconnected. Dispose synchronously removes paths and awaits close; a failed close is reported and requires retry.
- Returned startup/disposal failures are resolved result objects, not uncaught rejected promises in tested paths. Concurrent resume handler chains handle both resolution and rejection. No late note starts after stopAll/dispose in deterministic race tests.
- Release stop rescheduling follows [Web Audio AudioScheduledSourceNode.stop](https://www.w3.org/TR/webaudio-1.1/#dom-audioscheduledsourcenode-stop): a newer scheduled stop supersedes the earlier schedule. Mock supports this behavior rather than treating all second stop calls as invalid.
- Mock AudioParam evaluates scheduled envelope targets; mocks do not execute browser audio rendering, measure latency, detect real clicks, verify hardware output or prove garbage collection. Headroom is an analytical bound for the chosen bounded unit-peak sine paths, not an audio capture.
- Eight is a logical active-voice ceiling. Release tails overlap; emergency tail-budget eviction and immediate Stop/dispose truncate paths and require real listening for discontinuities.
- Suspended context, user activation, device interruption, audible eight-note chords/stealing/release, actual node/memory behavior and click/clipping quality remain NOT RUN until T3/T6 integration. No throwaway UI, browser, physical-audio, Lighthouse or React Profiler test was performed.
- Future UI must keep returned tokens, reconcile activeVoices after steals and handle release-before-startup completion at its input ownership layer. T2 creates no React pressed state or event listeners.
- H2-T2 automated gates passed; zero observed AI failures; await Senior Review. H2-T3 NOT STARTED.

## H2-T3 actual evidence - 2026-11-11 (Asia/Saigon)

### Scope and environment

- Preflight matched handoff: hw2 at 5cbcb2393986b4e794bd8abe149269b93c0ad0e8; c52d471/b7ee08d/5cbcb23 present. No tracked/staged changes; same five unrelated untracked files preserved.
- Read policies, T1/T2 modules/contracts/tests and current HW2 documentation. T2 approval and T3-only authorization came from the student's attached request.
- Implementation commit: `524404ad9570a1fb5a96bb49cef3013e7e45f3c3`. Nine explicitly staged new files: two components, input controller/hook, CSS Module, two tests and two browser fixture files. Full staged list/diff inspected; no H2-T1/T2 source, App, package or unrelated homework modification.
- Node v26.12.1 / npm 11.20.0 / Vite 7.3.7 on Windows PowerShell, repository root. No dependencies installed.

### Final mandatory gates actually executed

| Command | Actual result | Scope |
| --- | --- | --- |
| `node --test tests/hw2-input.test.js tests/hw2-keyboard.test.js` | Exit 0; 20 passed, 0 failed/skipped | 13 controller tests using actual synth + mock audio, seven actual-component SSR/handler/source checks |
| `npm.cmd test` | Final exit 0; 62 passed, 0 failed/skipped; no WebSocket diagnostic | 42 previous tests plus 20 new tests |
| `npm.cmd run lint` | Exit 0; no diagnostics | New source included; tests/fixture outside current lint script scope |
| `npm.cmd run build` | Exit 0; Vite built 39 modules in 1.91s | Existing App build; keyboard not yet added to App. SSR test transforms/imports actual new JSX/CSS modules |
| `git diff --check` | Exit 0 | Working tracked diff; staged check covers new files |
| `git diff --cached --check` | Exit 0 before implementation commit | All nine explicitly staged implementation/test/fixture files |

Earlier full-suite output included `WebSocket server error: Port 24678 is already in use` while still reporting 62 passed, 0 failed. The new SSR test had unnecessarily used Vite's default WebSocket listener. Set ws:false/hmr:false in that test only; reran focused/full/lint/build/diff gates with results above. See the genuine test-infrastructure finding in AI_FAILURE_AUDIT.md; do not label that earlier run diagnostic-free.

### Automated evidence and its limits

- SSR renders exactly 88 semantic buttons with type=button, note names, MIDI/entity attributes and initial aria-pressed=false. Stable React keys are verified by source inspection because React keys are not HTML attributes.
- Handler tests directly invoke the actual PianoKey function's event props: pointer down/up/cancel/leave/lost capture, captured move outside bounds, mouse-button filtering, Enter/Space prevention/repeat/composition, blur, assistive click and focus navigation targets. These are not browser event dispatch tests.
- Controller integration tests cover exact-token release, multiple input owners, immutable cached snapshots, FIFO pressed-state reconciliation, stale pending note-on/release races, window EventTarget blur, detach/dispose and StrictMode-like reattachment. This exercises controller lifecycle, not an actual React client mount or StrictMode effect replay.
- Audio startup failures update the error snapshot and can recover; component role=alert wiring inspected. Screen-reader delivery was not observed.
- Memo is real React.memo with default comparison; key note entities and callback references are stable across snapshots. No empirical per-key render count, React DevTools recording or commit-phase measurement was obtained. V10 remains PENDING.
- Accessibility/focus CSS and semantic wiring were reviewed against [WAI button keyboard interaction](https://www.w3.org/WAI/ARIA/apg/patterns/button/), [React memo](https://react.dev/reference/react/memo) and [cached external-store snapshots](https://react.dev/reference/react/useSyncExternalStore). This is not full WCAG AA or Lighthouse certification.

### Browser/Profiler/physical-audio blocker

- Started the existing Vite dev script on localhost port 5174, successfully reporting ready, with isolated fixture tests/piano-keyboard-test.html. No product App integration or later-task feature added.
- Browser inventory reported: `The browser access host is unavailable`.
- First native Chrome binding failed: `window is not a usable app window`. Refreshed windows and retried the returned Chrome window once.
- Computer-use then stopped because it could not determine the current browser URL on Windows confidently enough to enforce policy. All UI automation stopped; no barrier bypass or further browser action attempted. Closed the task-owned Vite process through its CLI session afterward.
- No fixture page was observed in the browser. Keyboard/touch interaction, focus visibility/scrolling, 375px layout, physical sound, IME, native synthesized-click behavior, React Profiler, screen reader and Lighthouse remain PENDING/NOT RUN. No screenshots or measurements fabricated.
- UI/UX search script could not run because Python was unavailable; used the skill's local accessibility guidance as fallback, not claimed search results.
- H2-T3 automated gates passed; pending browser/Profiler verification explicitly handed off for Senior Review. Do not begin H2-T4.

## Mandatory H2-T3 browser verification gate - 2026-11-11 (Asia/Saigon)

**STATUS: BLOCKED.** This record supersedes any interpretation of the prior automated handoff as complete browser acceptance. No mandatory browser interaction, Web Audio, Profiler or responsive check below was executed successfully. No PENDING result was converted to PASS.

### Policy and baseline

- Student requires real-browser verification for every future HW2 UI/interaction/accessibility/audio/browser-lifecycle task. H2-T4 remains prohibited until this gate passes; no H2-T4 code added.
- Branch hw2, HEAD `a667d237f5694cc3771b926a3ed8e94255ec2e61`. Policies read; no tracked/staged changes initially. The existing five unrelated untracked files preserved. Read package.json, vite.config.js and the existing StrictMode PianoKeyboard fixture; production App routing unchanged.
- No product change, new dependency, security-setting change, alternative browser-control workaround or history change made in this gate attempt.

### Environment and actual recovery evidence

1. Browser inventory again returned no connected browsers and `Browsers: Error: The browser access host is unavailable`.
2. Supported isolated-tab startup through cua.createBrowserTab('iab', 'about:blank') returned `The browser access host is unavailable`. Available tool discovery exposed no browser-host restart/reconnect operation.
3. Requested that the student reconnect browser/computer-use; no successful reconnection confirmation was received before this blocked handoff.
4. Started `npm.cmd run dev -- --host 127.0.0.1 --port 5174 --strictPort`. Actual output: Vite v7.3.7 ready in 326ms; Local: http://127.0.0.1:5174/.
5. Confirmed fixture URL from that actual origin plus the inspected fixture path: `http://127.0.0.1:5174/tests/piano-keyboard-test.html`. A CLI Invoke-WebRequest returned HTTP 200 and the expected title/script. This proves HTTP serving only, not client React execution or browser PASS.
6. Native fallback used fresh window inventory; successfully bound an existing Google Chrome window. Created a separate Chrome window with Ctrl+N, refreshed inventory and bound the returned `New Tab - Google Chrome` window. Original user tabs were not navigated or edited.
7. Attempted navigation to the confirmed fixture URL. Computer-use returned: `Computer Use has been stopped for this turn because it could not determine the current browser URL on Windows with enough confidence to enforce policy.` UI automation stopped immediately. The resulting navigation/focus state is unknown; no page observation, screenshot, browser version or viewport measurement was obtained.
8. Did not use DevTools injection, another automation channel or browser flags to evade the stop. No security barrier was bypassed. Task-owned Vite server is stopped at the blocked handoff; the new browser window may remain open because no further UI actions were permitted.

### Per-test execution matrix

Common metadata for all rows: attempted browser Google Chrome on Windows; exact browser version **NOT OBTAINED**; application URL `http://127.0.0.1:5174/tests/piano-keyboard-test.html`; tested viewport **NONE**. Rows identify intended target widths rather than falsely asserting they were applied. Actual result for every row: NOT EXECUTED because browser access host was unavailable and native fallback was stopped by URL policy enforcement (evidence steps 1, 2 and 7 above). No subjective listening, console logs, traces, screenshots, render counts or signal measurements were obtained.

| Test ID | Target viewport | Intended steps (not executed) | Expected result | Actual result / status |
| --- | --- | --- | --- | --- |
| B01 | 1440px | Load fixture; count rendered note buttons and MIDI endpoints | 88 keys, MIDI 21-108 | NOT EXECUTED / BLOCKED |
| B02 | 1440px | Inspect key color classes/computed presentation | 52 white, 36 black | NOT EXECUTED / BLOCKED |
| B03 | 375px, 1440px | Tab through keys and inspect focused element/outline | Visible, unobscured focus | NOT EXECUTED / BLOCKED |
| B04 | 1440px | Hold/release Enter and Space on focused key; include repeat | One activation per owner, release on keyup | NOT EXECUTED / BLOCKED |
| B05 | 375px, 1440px | Use arrows, Home and End | Correct note receives visible focus; all notes reachable | NOT EXECUTED / BLOCKED |
| B06 | 1440px | Real pointer down/up on key | Pressed state and voice start/release once | NOT EXECUTED / BLOCKED |
| B07 | 1440px | Drag captured pointer outside key bounds | Owned note released on leave/move outside | NOT EXECUTED / BLOCKED |
| B08 | 375px, 1440px | Dispatch pointercancel through client browser; inspect state/audio | Owner released; no stuck note | NOT EXECUTED / BLOCKED |
| B09 | 1440px | Rapidly retrigger a note | No stale release, duplicate activation or stuck voice | NOT EXECUTED / BLOCKED |
| B10 | 375px, 1440px | Hold several pointer/keyboard owners | Simultaneous independent notes; shared MIDI ownership correct | NOT EXECUTED / BLOCKED |
| B11 | 1440px | Hold note then blur actual browser window | All owned notes released | NOT EXECUTED / BLOCKED |
| B12 | 1440px | Cancel/release/unmount while startup pending | No late or stuck note after cleanup | NOT EXECUTED / BLOCKED |
| B13 | 1440px | Mount error-injected synth fixture; activate key | Visible role=alert feedback and recoverable UI | NOT EXECUTED / BLOCKED |
| B14 | Both | Capture console during mount/interactions/cleanup | No unexpected errors or unhandled rejections | NOT EXECUTED / BLOCKED |
| A01 | 1440px | Observe real AudioContext creation/state before and after gesture | Lazy initialization/resume | NOT EXECUTED / BLOCKED |
| A02 | 1440px | Measure real-browser waveform/RMS after noteOn | Nonzero measurable signal; label as measurement, not listening | NOT EXECUTED / BLOCKED |
| A03 | 1440px | Release note and measure output/nodes after envelope | Oscillator ends; output returns to silence | NOT EXECUTED / BLOCKED |
| A04 | 1440px | Start voices; Stop/dispose; measure output/context | Silence and cleanup | NOT EXECUTED / BLOCKED |
| A05 | 1440px | Start eight notes; inspect engine and real graph/output | Eight logical voices supported | NOT EXECUTED / BLOCKED |
| A06 | 1440px | Start ninth note; inspect tokens and indicators | FIFO oldest stolen; correct affected keys | NOT EXECUTED / BLOCKED |
| A07 | 1440px | Repeat mount/unmount and inspect Web Audio lifecycle | No retained live nodes/context after successful disposal | NOT EXECUTED / BLOCKED |
| P01 | 1440px | Instrument real client React Profiler at memoized key boundary | Actual per-key committed updates recorded | NOT EXECUTED / BLOCKED |
| P02 | 1440px | Clear mount samples; activate one key | Unrelated key subtrees do not commit updates | NOT EXECUTED / BLOCKED |
| P03 | 1440px | Profile ninth-note steal separately | New/stolen keys may update; unrelated keys isolated | NOT EXECUTED / BLOCKED |
| P04 | 1440px | Separate StrictMode render invocations from commit samples | Honest mount/update counts and method limitations | NOT EXECUTED / BLOCKED |
| R01 | 375px | Set actual viewport, compare document scrollWidth/clientWidth | No document horizontal overflow | NOT EXECUTED / BLOCKED |
| R02 | 1440px | Set actual viewport, compare document scrollWidth/clientWidth | No document horizontal overflow | NOT EXECUTED / BLOCKED |
| R03 | 375px | Navigate entire keyboard with keyboard-only input | Contained scroll and reachable focused keys | NOT EXECUTED / BLOCKED |
| R04 | Both | Inspect accessible names, roles and aria-pressed after interaction | Correct named buttons and logical state | NOT EXECUTED / BLOCKED |
| R05 | Both | Review focus, contrast and obvious accessibility issues | No obvious violations in tested workflows | NOT EXECUTED / BLOCKED |
| R06 | Both | Run Lighthouse/axe if available after access restored | Record actual report/scope; no certification inferred | NOT RUN / BLOCKED; optional tooling availability unknown |

### Remediation and resume procedure

- Student/environment operator must restore the browser access host/connection, or make the supported native Chrome surface expose its URL reliably to computer-use. The agent cannot restart a missing host through any currently exposed tool and cannot disable its URL policy enforcement.
- Restart/reconnect the browser/computer-use integration through the application's normal controls; report readiness. On resume first inventory surfaces and confirm safe URL access, then start the same existing Vite script and use its actual emitted URL.
- If native binding stops again, obtain help from the environment operator rather than disabling URL checks, browser protections or changing transport to bypass policy.
- Once access works, run every mandatory matrix row in the real client browser, add isolated test-only Profiler/Web Audio instrumentation where needed, capture browser/version/URL/actual viewports and real measurements. Fix/reproduce any discovered H2-T3 defects, add regression tests and rerun full tests/lint/build before verified commits.
- No new AI-generated defect demonstrated in this blocked attempt; no failure count increment. Previous H2-T3 automated results remain historical and do not pass this browser gate.
- No automated regression suite rerun: no source/test change or reproduced product defect in this attempt. git diff --check is run for the documentation change only.
- No commits created while the mandatory browser gate is blocked; these evidence/WBS updates remain local for review, consistent with the successful-verification condition in the approved auto-commit policy. H2-T4 remains NOT STARTED.

### Reconnection retry and prepared measurement harness

- After the student reported reconnecting browser access, retried inventory, reset the cua JavaScript session and reinitialized it. Both inventories still returned no browsers with `The browser access host is unavailable`.
- Native fallback now successfully bound the current Chrome window and read its existing URL. To avoid repeating the earlier navigation-policy failure, requested that the student open the confirmed local fixture in a new tab. Subsequent fresh window inventory still showed only the existing non-fixture Chrome title; fixture readiness has not been confirmed. No client test was executed or marked PASS.
- Restarted the same Vite command; actual output reported ready in 318ms at http://127.0.0.1:5174/. Kept this task-owned server running for the requested manual opening of http://127.0.0.1:5174/tests/piano-keyboard-test.html.
- Prepared an isolated test-only harness in tests/piano-browser-gate.jsx and .css, mounted by tests/piano-keyboard-test.jsx. It offers real-client scripted event checks, separate native-event capture, real AudioContext/AnalyserNode signal measurements, and per-key React Profiler instrumentation. No measurements have been obtained from it yet; its READY state is not a result.
- Profiler method prepared: instrument the existing memo object's inner type in the isolated fixture, retaining its default comparator; collect actual onRender commit samples separately from StrictMode render invocations. This is test instrumentation, not production performance measurement. It still requires actual client-browser execution before any claim about render isolation.
- Real-audio instrumentation prepared: native AudioContext, gain/oscillator nodes and AnalyserNode behind a test-only context facade; no audio mocks in this harness. Actual waveform/RMS and closure results remain NOT RUN.
- Preparation checks only: Vite transformed the harness module with HTTP 200; npm test exited 0 with 62/62 passed; npm run lint exited 0; npm run build exited 0 (39 current App modules, 841ms). These do not exercise the new browser harness or substitute for the mandatory gate.
- Current status remains BLOCKED/AWAITING FIXTURE ACCESS. No commit, no policy change, no production change and no H2-T4 work. The manual-open request remains pending.

### Retry after student confirmed opening the fixture

- Student confirmed the fixture was opened. Fresh native inventory initially returned a Chrome window titled with the existing chat, without a piano tab in its exposed tab list. Attempting its screenshot returned `window is not a usable app window`.
- Following documented stale-window recovery, a fresh inventory returned different existing Chrome windows, still without a piano title. Automatic approval review rejected binding the returned Facebook window because it was an unrelated signed-in private session. No private-window workaround, further binding to that target, or policy bypass was attempted.
- Requested that the student foreground the actual local fixture and confirm its displayed title/browser, so the next binding can target only the authorized piano surface. This is an environment/target-selection handoff, not a request to authorize unrelated private content.
- Server recheck still returns HTTP 200 with the expected fixture title. That does not prove which tab is open or execute any mandatory browser test. All test rows remain BLOCKED; no new measurements, screenshots, PASS results or commits.

- Student subsequently confirmed the actual gate title in Chrome. Fresh tool inventory still exposed only the unrelated chat window; direct binding to the exact authorized localhost fixture URL returned `The browser access host is unavailable`. The tool surface does not match the student's reported foreground fixture.
- Safe next step requested: student runs the existing Run client checks button and provides the complete Actual evidence JSON. Any resulting real-client observations will be labelled student-assisted and evaluated from their actual measurements; no automation, independent observation or PASS is claimed while that result is pending. No further access to unrelated signed-in windows attempted. The fixture server remains running for this handoff.

### Student-assisted real-client evidence received - partial gate results

Source: [raw JSON supplied by the student](evidence/client-1442-student.json), preserved without changing values (formatting only). This was generated by the known client harness and pasted by the student, not captured independently through browser automation. Browser UA reports Chrome/156.0.0.0 on Windows; this is not an independently queried executable version. Exact URL: http://127.0.0.1:5174/tests/piano-keyboard-test.html. Actual viewport 1442x905, document width 1425. Timestamp 2026-11-10T20:43:13.350Z = 2026-11-11 03:43:13.350 Asia/Saigon.

The following assessments use the actual numbers, not only the harness PASS labels. Earlier all-BLOCKED rows are historical attempts; only the scoped partial results below are now supported. Overall mandatory gate is STILL INCOMPLETE/BLOCKED for missing tests.

| Test IDs | Executed steps / method | Expected | Actual supplied evidence | Assessment |
| --- | --- | --- | --- | --- |
| B01-B02 | Student clicked Run client checks; client DOM queried buttons/color classes | 88/52/36 | 88 keys, 52 white, 36 black | PASS student-assisted client DOM counts; visual geometry not independently inspected |
| R04-names | Harness inspected DOM names | Named A0-C8 buttons | First Play A0, last Play C8; all-name predicate passed | PASS within DOM-name check scope |
| B04 | Synthetic browser KeyboardEvents through actual React handlers | Enter/Space pressed states, prevention and repeat suppression | Enter [60], prevented=true; Space [64]; repeat voice count stays 1 | PASS client-handler scope; native keyboard/default-click interaction still pending |
| P01-P02/P04 | Test-only Profiler around memo inner subtree; samples cleared after mount | Only target commits; distinguish StrictMode invocations | One update sample MIDI60, actualDuration=0; render invocations [60,60] | PASS for instrumented single-key commit isolation; duration=0 is not proof of zero rendering cost; two invocations are not two commits |
| A01 | Existing real context state checked after activation | Running context | Before=1, now=1, state=running | PARTIAL: running confirmed; no evidence of lazy creation or resume from suspended state in this sample |
| A02 | Real AnalyserNode waveform RMS | Nonzero signal | RMS 0.025572997882468595 | PASS measurable signal; no human listening/click/distortion claim |
| A03 | Release and await 160ms; inspect pool and analyser | No active/tail notes, silence | Active=0, tails=0, RMS=0, cumulative ended=28 | PASS for this measured release; ended=28 is cumulative, not one-run allocation proof |
| B05 | Synthetic arrow/Home/End events and actual focus target reads | MIDI61/21/108 respectively | right=61, home=21, end=108 | PASS client navigation target behavior; native focus visibility remains pending |
| B09 | Twelve rapid synthetic Enter down/up pairs | No stuck logical voices | pressed=[], voices=0 | PASS for scripted client retrigger sequence |
| B10/A05 | Eight simultaneous synthetic key owners | Eight active/pressed notes and signal | MIDI60-67 active/pressed; RMS 0.08711262531104794 | PASS real-engine eight-voice client sequence; not physical multi-touch |
| A06/P03 | Ninth note with real engine and Profiler | Oldest replaced; only new/stolen keys commit | MIDI61-68 active/pressed; committedKeys=[60,68]; invocations=[60,60,68,68] | PASS FIFO and instrumented affected-key isolation |
| R01-R02 | Client document-width comparison | No overflow at actual tested width | 1425 <= 1442 | PASS at 1442px only; mandatory 375px and 1440px remain unexecuted |
| B14 | Harness console.error/error/unhandledrejection capture during scope | No captured unexpected errors | capturedErrors=[] | PASS captured scope; not a complete browser DevTools console export |

Still required: native pointer down/up/leave/cancel and no-stuck behavior, native keyboard-only focus/activation, actual window blur, startup error feedback, initial lazy/resume lifecycle, real Stop/dispose/closure measurement, unmount cleanup, exact 375px and 1440px navigation/overflow/accessibility review. No full WCAG certification, Lighthouse score, physical listening or independent automation claim. Requested the remaining browser evidence; no commit before gate completion, no H2-T4.

## Agent real-browser evidence - 2026-11-11 (Asia/Saigon, afternoon)

### Provenance

- Browser: Claude desktop built-in browser pane, Electron Chromium 156 (UA `Claude/5.1231.2 Chrome/156.0.8078.75`), Windows, DPR 1.25, driven by the agent (Claude). This is not the student's Chrome. 375x812 and 1440x900 were set with viewport emulation (375 also emulates an Android UA; clicks remain mouse events).
- Fixture: http://127.0.0.1:5174/tests/piano-keyboard-test.html; integrated page: http://127.0.0.1:5174/ (student's Vite dev server).
- Native = agent computer-tool pointer/keyboard input (`isTrusted: true`). Synthetic = DOM events or `.click()` dispatched by script (labelled).
- Raw evidence: `docs/hw2/evidence/agent-01` to `agent-14` JSON (whitespace-normalized transcriptions of on-page output). Student-captured evidence: `client-1442-student.json`, `step1` to `step4-*-student.json`.

### H2-T3 browser gate results

| Area | Method | Result | Evidence |
| --- | --- | --- | --- |
| Lazy AudioContext | Native; fresh load then capture | PASS: contexts [] before first key; created inside a trusted gesture | agent-01, agent-12, agent-10 (contextsBeforeGesture 0) |
| Resume after gesture | Native press after harness-forced `suspend()` | PASS: resumeCalls 1, state running. Suspension was forced by the harness, not by autoplay policy | agent-12 |
| Pointer down/up, drag-out, lost capture | Native drag/click | PASS: pressed during hold, released on captured move outside, lostpointercapture, no stuck note | agent-02, step3a |
| pointercancel | Native pointerdown + harness-dispatched cancel (synthetic) | PASS after harness fix (see AI audit #02); browser-originated cancel not produced | agent-06 |
| Keyboard focus / activation | Native ArrowRight, Enter, Space, Home, End, ArrowLeft | PASS: focus 24→25→21→108→107, :focus-visible with solid outline rgb(0,117,185) (CSS 3px, computed 2.4px at DPR 1.25), Enter/Space press+release, focused key scrolled into view | agent-03, step4 |
| Window blur while held | Agent attempts failed (agent-04); student native Alt+Tab in Chrome 157, 2026-11-12 | PASS: before blur pressed [60], active voice-1; first trusted window-blur sample pressedAfter [], activeAfter []; the one oscillator ended; errors [] | step5-window-blur-while-held-student |
| Startup failure + recovery | Native press with injected failure, then Restore | PASS: role=alert text, no stuck key, no error; recovery via remount. In-place retry not exercised | agent-05 |
| Stop/dispose | Real engine + analyser | PASS: RMS 0.0235 → 0 → context closed | agent-08, step1 |
| Unmount while held | Native hold + unmount | PASS: context closed, active [] | agent-04 |
| Client checks at 1440 and 375 | Harness "Run client checks" | 15/15 PASS at 1440x900 and at 375x812 (cold context, after A02 harness fix) | agent-07, agent-10; failing pre-fix run agent-09 |
| Layout | Measured scrollWidth | 375: 375 (no overflow); 1440: 1425 | agent-10, agent-11 |
| Profiler isolation | Instrumented Profiler | single press commits [60]; ninth voice commits [60,68] | agent-07, agent-10 |
| Console | Pane console | 0 app warnings/errors | agent-11 |
| Multi-touch | — | BLOCKED: no touch hardware | — |

### H2-T4 to H2-T6 browser results (integrated App)

| Area | Method | Result | Evidence |
| --- | --- | --- | --- |
| Record take | Native Record, three held notes, Stop recording | PASS: "Recorded 3 notes."; entry durations within 5 ms of aria-pressed durations | agent-13 |
| Replay 1x / 2x / 0.5x | Native Play; speed via form_input on the labelled select | PASS: onsets and durations within 13 ms of schedule at every speed | agent-13 |
| Stop during replay | Native Stop playback at 0.5x with a note held | PASS: held note released, later note never played, status "Playback stopped." | agent-13 |
| Transport state | DOM | Record disabled while playing; Stop enabled only while playing | agent-13 |
| Unmount during replay | Real component in StrictMode, synthetic input, real Web Audio | PASS: no context before gesture; 0 oscillators after unmount; context closed; 0 errors | agent-14 |
| 375 / 1440 layout | Emulated viewport | 375: no overflow outside the key viewport, controls ≥ 44 px; 1440: 1425 | agent-14 |
| Visual inspection of App | Screenshot | NOT CLAIMED: screenshot failed (Claude window minimized) | agent-14 |

### Automated regression (agent cloud copy)

Copy of the working tree in the agent's Linux container (Node v22.23.4, `npm ci` from the committed lockfile). This is not the student's Windows/Node 24 environment.

- `npm test`: 79 tests, 79 pass, 0 fail (62 previous + 7 recording + 8 sequencer + 2 GrandPiano88/App SSR).
- `npm run lint`: exit 0. `npm run build`: exit 0.
- Trailing whitespace check on changed HW2 files: none. Banned-pattern grep on `src/homeworks/GrandPiano88` and `src/App.jsx`: none.
- The student must re-run `npm.cmd test`, `npm.cmd run lint`, `npm.cmd run build` and `git diff --check` before committing.

### Still pending (student)

- Lighthouse Accessibility report, screen-reader pass, physical listening, multi-touch. (Window blur while held: PASS 2026-11-12, step5.)

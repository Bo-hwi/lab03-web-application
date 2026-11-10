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

# HW2 Verification

## Evidence rules

Prepared 2026-11-11 (Asia/Saigon). HW2 feature implementation has not begun.
No build, feature test, browser, audio, Lighthouse or React Profiler PASS is claimed by this planning document.
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
| V01 | Notes/contracts T1 | MIDI range, uniqueness, 88/52/36 split, color cycle, endpoint names, A4/formula/tolerance tests | Contract review; no UI yet | Correct algorithmic immutable notes and explicit timeline | PENDING |
| V02 | FIFO voices T2 | Fake AudioContext eight/nine voices, oldest-first steal, repeated MIDI ownership and reinsert order | Hear chords/steal once UI exists | Max eight active voices under approved tail policy | PENDING |
| V03 | Envelope/disposal T2 | Positive ramp floor, ADSR scheduling, 40ms release, stop/disconnect, stale onended and dispose race | Listen for pops/clipping; inspect real context behavior | Controlled musical release and no leaked audio resources | PENDING |
| V04 | Audio startup T2/T6 | Suspended resume success/rejection, disposal during resume, lazy creation | First gesture unlock, suspended context and failure UI | No render-time context side effects or late audio | PENDING |
| V05 | Input lifecycle T3 | Down/up, repeat, multi-source ownership, pointercancel/lost capture, blur, editable-target tests | Keyboard, IME where available, touch chords, drag-out release | Correct release and no stuck/duplicate notes | PENDING |
| V06 | Key semantics T3/T6 | Actual component SSR/interaction checks, 88 stable identities, named buttons and explicit type | All notes keyboard reachable; Enter/Space; focus navigation | Accessible generated 88-key instrument | PENDING |
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
| H2-T1 | NOT RUN | No UI yet; future T3/T6 checks | NOT STARTED | Awaiting approval / no commit |
| H2-T2 | NOT RUN | PENDING integration | NOT STARTED | PENDING / no commit |
| H2-T3 | NOT RUN | NOT RUN | NOT STARTED | PENDING / no commit |
| H2-T4 | NOT RUN | NOT RUN | NOT STARTED | PENDING / no commit |
| H2-T5 | NOT RUN | NOT RUN | NOT STARTED | PENDING / no commit |
| H2-T6 | NOT RUN | NOT RUN | NOT STARTED | PENDING / no commit |
| H2-T7 | NOT RUN | NOT RUN | NOT STARTED | PENDING / no commit |

## Known coverage limitation inherited from base

tests/developer.test.js imports src/exercises/DeveloperCard.jsx, while src/App.jsx imports src/components/DeveloperCard.jsx. Do not use those tests as proof for the current DeveloperCard or HW2. Tests added for HW2 must target the actual HW2 modules. A passing existing telemetry suite proves only its service checks, not piano behavior.

# HW2 - 88-Key Polyphonic Piano & Concurrent FIFO Sequencer

## Planning status and scope

Planning prepared on 2026-11-11 (Asia/Saigon). H2-T1 was subsequently approved and implemented; its verification passed and it now awaits Senior Review.
H2-T2 through H2-T7 have not started and require approval before implementation.
HW1 is complete according to the student and is outside this work's scope. Do not redo it.

- Common base: `ex3` at `4195b26ed903ecffdfdfa5b20f4ed1ca70e0fe4d`.
- Target branch: `hw2`, independent of HW1/HW3 changes.
- Follow `AGENTS.md` and `project-rules.md`; never change policy to bypass it.
- The student commits manually. Proposed messages below are not executed commands.
- No component, audio engine, package installation or feature test is part of this planning change.
- Source root proposed below: `src/homeworks/GrandPiano88/` (abbreviated P).
- Test files are proposed paths, not existing or implemented tests.
- Use JavaScript/JSX and JSDoc contracts; PDF TypeScript examples do not require a migration.

### H2-T1 approval and completion update

- Policy commit: `2083657f60b84a54608a2d5d89430a595d1584e3`. Approved HW2 auto-commit policy supersedes the older manual-commit procedure preserved below.
- Implementation commit: `cb5512afa9e7c722bd7b270a6d7dd084c8794841`.
- The student approved performance.now() timing, first delta from recording start, later deltas from previous note-on, overlap/chord preservation, deterministic equal-timestamp order, held-note finalization at Stop, and immutable serializable events.
- Implemented only pure note data, event validation/snapshot creation, onset ordering and tests. No clock acquisition, recorder, replay, React component or Web Audio engine was added.
- Final serialized events have exactly four fields. Internal onsetOrder metadata is separate; event/UI identity for a future recording log remains a T4 concern.
- Duplicate input ownership, stolen-note duration and transport policies remain open for T2/T4/T5. They do not block the approved T1 data contracts.
- Focused tests 13/13; full suite 19/19; lint/build and working/staged diff checks exit 0. See VERIFICATION.md for commands, scope and limits. Audit checkpoint found zero observed AI-generated failures.
- Stop here for Senior Review. H2-T2 is not authorized by this completion.

## Assignment requirements and traceability

Source: workspace Lab 03 PDF, 35 slides; slide numbers are 1-based PDF pages.

| ID | Mandatory requirement | Source | Tasks | Verification reference |
| --- | --- | --- | --- | --- |
| R01 | Algorithmically generate A0-C8 / MIDI 21-108 inclusive; 88 keys, 52 white and 36 black; no 88 hardcoded tags | 27; MIDI bounds clarified in user request | T1, T3 | V01, V06 |
| R02 | Frequency `440 * 2 ** ((midi - 69) / 12)` | 27 | T1 | V01 |
| R03 | Eight active Web Audio voices; ninth steals oldest using FIFO Map insertion order | 27-28 | T2 | V02 |
| R04 | ADSR-style gain envelope; release toward 0.0001 over 0.04s before stop; clean node disposal | 28; full ADSR/disposal reinforced by user | T2, T6 | V03, V12 |
| R05 | Immutable recorded events contain MIDI, frequency, durationMs and deltaMs | 28 | T1, T4 | V07 |
| R06 | Asynchronous FIFO replay at 0.5x, 1x and 2x | 28 | T5 | V08 |
| R07 | AbortController cancellation; Stop cancels scheduled work and silences voices; unmount cleanup | 28 | T2, T5, T6 | V09, V12 |
| R08 | React.memo with stable props; unrelated piano keys do not render on a single-key update | 27 | T3, T7 | V10 |
| R09 | Semantic JSX, CSS Modules/root custom properties, immutable state, honest effect dependencies and cleanup | 3, 8; repository rules | All | V11-V14 |
| R10 | WCAG 2.2 AA, labelled useId controls, keyboard/focus support, zero page overflow at 375px; Lighthouse Accessibility 100 | 34; repository rules | T3, T6, T7 | V06, V11, V13 |
| R11 | Contract-first WBS, verification before atomic student commits, genuine AI failure audit | 3, 8, 25, 34 | All | Per-task gate, V15 |

## Ambiguities and proposed decisions for senior review

These are proposals, not already approved implementation contracts.

1. Timeline: define deltaMs as onset-to-previous-onset, first onset relative to recording start. Preserve onset ordering even when notes finish out of order. Replay schedules onsets without awaiting prior note-off, preserving chords. Scale both deltas and durations by speed. Use a monotonic recording clock.
2. Event identity: include a stable event ID and onset ordinal in addition to the four required fields; use stable note entity IDs for UI keys, never display text or array position.
3. Held notes: recording Stop finalizes open durations at the stop timestamp; repeated note-off is harmless. Decide whether voice-stealing finalizes audible duration or preserves physical key-hold duration before coding T4.
4. Duplicate MIDI/input ownership: the reference ignores a second noteOn for an already active MIDI. Propose one sounding voice per MIDI with source ownership tokens so releasing one pointer/key cannot release a note still held by another. Specify repeat/retrigger and FIFO age semantics in T1/T2.
5. Voice limit: propose eight active voices excluding bounded 40ms release tails. Reference prose does not say whether tails count toward the physical oscillator maximum; confirm this interpretation before T2.
6. Envelope: exact attack/decay/sustain parameters and waveform are unspecified. Propose configurable constants, a positive ramp floor, bounded master gain/headroom, 40ms musical release, and a separately defined immediate Stop path. Do not claim the eight-voice limit alone prevents clipping.
7. Immediate Stop: propose synchronous invalidation of the replay generation and master output mute, cancellation of waits, then deterministic oscillator stop/disconnect. Normal note release may use the musical ramp. No later continuation may sound or silence a newer session.
8. Transport: propose explicit idle/recording/playing states; freeze speed per replay; Stop then Play to change it. Disable recording during replay and finalize recording before replay. Confirm policy for live input during replay; proposed initial behavior disables it to avoid competing ownership.
9. Accessibility: physical computer-key mapping is not specified. Propose documented e.code shortcuts for a limited playable range plus keyboard navigation/Enter/Space for all 88 named buttons. Ignore editable targets/composition, handle keyup, repeat, blur and pointercancel/capture loss.
10. Mobile: propose a contained horizontally scrollable piano viewport with keyboard focus scrolling into view. The page itself must not overflow at 375px. No virtualization is necessary for just 88 keys unless measurements show otherwise.
11. Profiler: test a settled single-key press with no stealing; only that key may update among 88 keys. Parent/transport updates are allowed. Stealing legitimately changes the new and stolen key indicators. Distinguish development StrictMode invocations from committed Profiler updates.
12. Reference gaps: slide 28 calls noteOff without defining it and omits dispose/resume/envelope completion. Slide 27 provides pointer handlers but no keyboard activation or cancellation. Implement the requirements, not an unmodified snippet.
13. Audit scope: slides 25/34 ask for three genuine bugs across the Lab; the per-homework quota is not explicit. Track HW2 independently and disclose any evidence gap rather than borrowing HW1 findings.
14. Recording limits, persistence/export, sustain pedal, MIDI hardware input and exact audio latency targets are unspecified. Propose bounded in-memory recording with an announced limit (value to approve), no extra features, and measured rather than invented timing tolerances.

## Shared checkpoint after EVERY implementation task

1. Review the task's contract, requirement IDs, diff and scope. Preserve all HW1 files.
2. Run the relevant automated tests plus build and lint; record exact commands, exit status, environment and actual results in VERIFICATION.md. A passing build is not feature acceptance.
3. Perform the task-specific browser checks below. When UI is not yet available, record BLOCKED/NOT APPLICABLE and the later integration task that owns the check. Do not claim PASS from mocks or inspection alone.
4. Inspect StrictMode lifecycle, cancellation, semantics, keyboard/focus and 375px behavior whenever the task affects them. Capture Profiler evidence when relevant.
5. Update AI_FAILURE_AUDIT.md with real observed AI-generated failures only. If none, record the checkpoint and zero new failures; no hypothetical entry or quota padding.
6. Link task -> real evidence -> correction -> proposed student commit. Ask for senior review of the completed slice before advancing; never run git commit.

## H2-T1 - Piano note generation and recording timeline contracts

- Status: IMPLEMENTED AND VERIFIED - AWAITING SENIOR REVIEW.
- Objective: Establish correct note data and explicit timing/state contracts before the engine/UI.
- Scope: Generated immutable note entities; MIDI/name/color/frequency helpers; JSDoc note, recorded event, ownership and transport contracts; resolve proposals 1-4 and 8 before dependent work.
- Dependencies: T1 implementation explicitly approved; core timeline rules confirmed in the student's task instruction. Remaining audio/ownership/transport decisions deferred to their implementation tasks.
- Files: P/notes.js, P/contracts.js, tests/hw2-notes.test.js, tests/hw2-contracts.test.js; these HW2 documents.
- Acceptance: exactly 88 unique stable note entities covering MIDI 21-108, endpoints A0/C8, 52/36 split; A4=440; no hardcoded 88-tag/data list. Contracts explain delta origin, overlaps, repeated MIDI, open notes and speed scaling.
- Automated verification: Node tests for all MIDI values/counts/IDs/color cycle, endpoint naming, frequency formula and reference pitches with numeric tolerance; build/lint. No mirror-only assertions.
- Manual browser verification: No new UI in this task; browser key/audio checks NOT APPLICABLE until T3/T6. Review contracts and generated data with the senior; do not label this browser PASS.
- Actual commit: `cb5512afa9e7c722bd7b270a6d7dd084c8794841` - `feat(hw2): define piano notes and sequence timing contracts`.
- Checkpoint: shared verification and genuine-failure audit gate above; stop for review.

## H2-T2 - Polyphonic audio engine and FIFO voice management

- Status: PENDING.
- Objective: Own Web Audio resources and manage deterministic eight-voice polyphony.
- Scope: Lazy user-gesture context unlock/resume; FIFO Map; note ownership; ADSR gain; release/steal; stopAll/dispose; headroom and idempotent cleanup. No React piano UI.
- Dependencies: T1; approved active/tail limit, envelope and Stop contracts.
- Files: create P/audio/PolyphonicSynth.js, tests/hw2-synth.test.js and a fake AudioContext test helper if needed; update HW2 documents.
- Acceptance: eight active voices maximum; ninth steals exact oldest; released/retriggered notes obey contract; releasing voice A cannot delete a replacement voice B for the same MIDI; nodes disconnected on end/dispose; no context created during render; no delayed resume can sound after disposal.
- Automated verification: injected fake context/clock; eight/nine-note order; duplicate ownership; release tails and stale onended; stop/dispose twice; suspended resume success/failure and dispose race; envelope scheduling and bounded resource counts; build/lint.
- Manual browser verification: Once integrated, hear eight-note chords, ninth-note steal, release and Stop; inspect suspended/resumed audio and resources. Until T3/T6, record these checks BLOCKED BY UI, not PASS. Do not add a throwaway product page just to claim testing.
- Proposed commit: `feat(hw2): implement polyphonic audio engine and FIFO voices`.
- Checkpoint: shared gate; preserve real failures/evidence and stop for review.

## H2-T3 - Accessible, memoized 88-key keyboard

- Status: PENDING.
- Objective: Provide reliable, isolated key interaction for all 88 notes.
- Scope: React.memo keys; stable callbacks/scalar props; immutable pressed state; semantic list/buttons; pointer capture/cancel and keyboard activation/navigation; visible held/sounding distinction if required by contracts.
- Dependencies: T1, T2.
- Files: create P/PianoKey.jsx, P/PianoKeyboard.jsx, P/usePianoInput.js, initial CSS Modules and appropriate interaction tests; update HW2 documents. Temporary integration only in the intended HW2 view when approved, never HW1.
- Acceptance: 88 generated named buttons with type=button; aria-pressed reflects documented state; all notes keyboard reachable; no duplicate trigger from native click plus custom handlers; no stuck note after release outside, cancel, blur or editable typing; stable note entity IDs; unrelated keys do not update.
- Automated verification: input/ownership tests for down/up, repeat, pointercancel, editable targets, native activation deduplication and release-all; SSR semantic checks for the actual new component; build/lint. Browser automation dependencies require separate justification before installation.
- Manual browser verification: keyboard-only navigation and Enter/Space, multi-pointer chord, drag-out release, focus loss, Vietnamese IME where available; initial Profiler check after mount; identify any remaining screen-reader/375px work for T6.
- Proposed commit: `feat(hw2): add accessible memoized 88-key keyboard`.
- Checkpoint: shared gate; capture Profiler evidence or mark it PENDING; stop for review.

## H2-T4 - Immutable note recording and event timeline

- Status: PENDING.
- Objective: Capture polyphonic playing as deterministic replayable events.
- Scope: Recording start/stop and state transitions, monotonic timestamps, open-event completion, immutable event updates, bounded history and stable event IDs. Derive displays during render.
- Dependencies: T1-T3; approved stolen-note and recording-limit semantics.
- Files: create P/recording.js, P/useRecording.js, P/RecordingControls.jsx, tests/hw2-recording.test.js; modify the HW2 view only as needed; update documents.
- Acceptance: each completed event contains MIDI/frequency/durationMs/deltaMs plus identity; durations nonnegative and finite; onset order preserved despite reversed release order; simultaneous chord onsets preserved; Stop finalizes held notes; source snapshots unchanged; bounds announced accessibly.
- Automated verification: injected clock traces for chords, rests, repeated MIDI, out-of-order releases, empty/zero-duration recording, stop with held notes and bounds; immutable snapshot assertions; build/lint.
- Manual browser verification: record a chord plus separated notes; check visible event order/count, accessible status and Stop while keys held; compare playback behavior later in T5.
- Proposed commit: `feat(hw2): record immutable polyphonic note timelines`.
- Checkpoint: shared gate; audit actual recording failures and stop for review.

## H2-T5 - Asynchronous variable-speed replay and cancellation

- Status: PENDING.
- Objective: Replay FIFO onset events without losing polyphonic overlap or cancellation safety.
- Scope: Abortable waits/scheduler; speed 0.5/1/2; generation ownership; Play/Stop controls; FIFO dispatch; independent note-off scheduling; user-visible errors.
- Dependencies: T2-T4; approved transport and immediate-stop policy.
- Files: create P/sequencePlayer.js, P/useSequencer.js, P/SequencerControls.jsx, tests/hw2-sequencer.test.js; update HW2 view/documents.
- Acceptance: scale both onset deltas and durations; preserve overlap; waits and note-off work canceled on Stop/unmount; synchronous session invalidation; no stale note-on after Stop and no old-session note-off affecting a new replay; settle promises/rejections safely; stopped voices silent.
- Automated verification: deterministic clock at every speed; empty sequence; Stop before/during await and context resume; repeated Stop; Play-Stop-Play; abort listener/timer cleanup; old generation completion and rejected audio startup; build/lint.
- Manual browser verification: hear same phrase at 0.5/1/2x; Stop during chord/rest/startup; rapid replay restart; background tab and wake behavior; no console/unhandled rejection or stuck sound. Record timing/audio evidence honestly.
- Proposed commit: `feat(hw2): add abortable variable-speed FIFO replay`.
- Checkpoint: shared gate; preserve real race/cancellation evidence and stop for review.

## H2-T6 - Responsive integration, accessibility, and lifecycle cleanup

- Status: PENDING.
- Objective: Integrate the complete HW2 experience and close cross-component lifecycle/accessibility gaps.
- Scope: Final HW2 page, App integration, scoped piano viewport, labelled controls, root design tokens, reduced motion, error/status UI and coordinated unmount cleanup.
- Dependencies: T3-T5.
- Files: create/finalize P/GrandPiano88.jsx and P/*.module.css; modify src/App.jsx and src/styles.css only as necessary; add integration checks; update documents. Do not modify HW1.
- Acceptance: no horizontal page scroll at 375px or 1440px; all 88 keys reachable within contained viewport; visible/unobscured focus; useId labels on every input/select; AA contrast; user gesture audio startup; StrictMode setup-cleanup-setup safe; unmount cancels all playback/listeners/nodes/contexts.
- Automated verification: full relevant tests, integration/resource-count checks, static prohibited-pattern review, build/lint; verify imports need no HW1 branch code.
- Manual browser verification: 375/1440px, zoom and long text, contained scrolling, keyboard/screen reader, reduced motion, unavailable audio recovery, repeated mount/unmount; Lighthouse A11y target 100 with real report.
- Proposed commit: `style(hw2): integrate responsive piano and lifecycle controls`.
- Checkpoint: shared gate; distinguish automated accessibility scores from manual WCAG evidence; stop for review.

## H2-T7 - Final regression tests, React Profiler verification, and AI failure audit

- Status: PENDING.
- Objective: Produce reviewable end-to-end evidence and disclose remaining gaps.
- Scope: Regression suite, actual component test targets, final Profiler sessions, audio/memory checks, manual matrix, audit provenance and student commit traceability. Do not invent failures to fill a quota.
- Dependencies: T1-T6 and access to a real browser/DevTools/audio output.
- Files: tests/hw2-*.test.js as necessary, docs/hw2/TASK_DECOMPOSITION.md, VERIFICATION.md, AI_FAILURE_AUDIT.md; project-wide documentation only if needed, preserving existing sections.
- Acceptance: all requirements mapped to real evidence; final build/lint/tests actually run; isolated-key committed render evidence; FIFO/overlap/Stop/unmount regressions covered; Lighthouse/manual findings recorded; audit counts genuine failures and explicitly states if fewer than three; real hashes only after student commits.
- Automated verification: full project test suite plus targeted HW2 regressions, build, lint, git diff --check, source-policy and branch-independence review. Explain that old DeveloperCard tests target a different component from App until separately corrected.
- Manual browser verification: final instrument workflow; eight/nine notes, recording/replay all speeds, cancellation, keyboard/IME, 375px, screen reader, Lighthouse and Profiler. Record browser/version/device/settings and observation limits.
- Proposed commit: `test(hw2): verify piano regressions and document AI failures`.
- Checkpoint: shared gate and senior final review; no agent commit.

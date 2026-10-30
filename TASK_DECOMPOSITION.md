# Lab 03 — Task Decomposition

## Scope and delivery

Source: "Lab 03: Production React 19, KRAFTON PUBG VN & 'Hẹn Hò Nhưng Không Yêu' State Machine" (35 slides). This is the assignment reference, not executable or authoritative implementation code. Verify examples against current React documentation and tests.

- Use React 19, Vite, JavaScript, CSS, and browser APIs. Do not add unrelated UI, state, or test libraries.
- Build the three in-class exercises and three homework projects. Treat the Situationship Analyzer as a bonus task after required work.
- Keep the in-class exercises on `main`. Create independent `hw1/drum-kit`, `hw2/piano-queue`, and `hw3/pubg-arena` branches from the verified base.
- Record actual checks in `docs/verification/` and observed AI or reference failures in `AI_FAILURE_AUDIT.md`. Do not mark planned checks as passed.
- Commit the decomposition first. Commit each small verified task separately with a descriptive message. Push each submission branch after its final review.
- Submission language: English.

## Acceptance requirements from the slides

| ID | Requirement | Evidence |
| --- | --- | --- |
| R01 | React 19 application built with Vite and `createRoot`; no removed React APIs or class components | Dependency and source inspection; build |
| R02 | Semantic, responsive DeveloperCard and SkillBadge, including a 375 px layout and avatar fallback | DOM and browser checks |
| R03 | ScientistDirectory with stable IDs, case-insensitive search, numeric IQ filter, immutable IQ/age sort, delete and reset | Unit and browser checks |
| R04 | PubgMatchTelemetry with IDLE/LOADING/SUCCESS/ERROR, squad switch cancellation, retry and loading skeleton | Race-condition tests and browser checks |
| R05 | HW1 drum kit: physical key codes W/A/S/D/J/K/L, repeat/input guards, sound history, meter, accessible buttons and listener cleanup | Keyboard and audio checks |
| R06 | HW2 piano: generated A0–C8 keys (52 white, 36 black), correct MIDI frequency, maximum eight voices, FIFO stealing and recording/replay controls | Logic, audio and browser checks |
| R07 | HW3 arena: epoch-based countdown, visibility recovery, optimistic claim with 409 rollback/lock, live leaderboard and kill feed | Timer, race and browser checks |
| R08 | Accessibility: labeled controls, visible focus, live feedback and responsive layout | Manual keyboard/screen-reader review and Lighthouse where applicable |
| R09 | Task decomposition, verification report, README and honest AI failure audit | Repository review |
| R10 | Separate Git branches and meaningful commits; pushed source matches reports | Git history and remote comparison |

The slide examples require independent review. In particular, React StrictMode may intentionally render components and run effects more than once in development; a blanket "one render" assertion is not a valid test. The bonus state names differ between the slide narrative and sample contract and must be reconciled explicitly before implementation.

## Ordered work breakdown

Each task is complete only when its code or document change, focused verification, evidence update and dedicated commit are complete. Use `[x]` only for completed items.

### Main branch: foundation and exercises

- [x] M01 — Review slide text and rendered pages, record ambiguities, define this task decomposition. Commit: `docs: define Lab 03 task decomposition`.
- [ ] M02 — Scaffold React 19 + Vite, package scripts, project rules, basic navigation and build check. Commit: `chore: scaffold Lab 03 React application`.
- [ ] M03 — Implement Exercise 1 DeveloperCard and SkillBadge with semantic elements, stable IDs, avatar fallback and focused tests. Commit: `feat(ex1): build semantic developer card`.
- [ ] M04 — Add Exercise 1 CSS module and verify 375 px layout, keyboard focus and fallback rendering. Commit: `style(ex1): finish responsive developer card`.
- [ ] M05 — Define immutable ScientistDirectory fixtures and validation tests. Commit: `feat(ex2): add scientist fixtures`.
- [ ] M06 — Implement derived search, minimum IQ and immutable numeric sort; verify edge cases. Commit: `feat(ex2): add filtering and sorting`.
- [ ] M07 — Implement delete, reset and accessible result status; verify browser workflow. Commit: `feat(ex2): add delete reset and live status`.
- [ ] M08 — Build PubgMatchTelemetry squad data, request abstraction and explicit four-state reducer. Test cancellation and stale responses. Commit: `feat(ex3): add telemetry state machine`.
- [ ] M09 — Add 220 px skeleton, error view, retry and squad switching; verify loading and cleanup in browser. Commit: `feat(ex3): complete telemetry feedback`.
- [ ] M10 — Run integrated build, logic, keyboard and responsive checks; fix observed regressions in focused commits. Record `docs/verification/EXERCISES_VERIFICATION.md`.
- [ ] M11 — Write `README.md` and `AI_FAILURE_AUDIT.md` with at least three real, evidenced failures or reference defects and corrections. Commit documents separately from implementation.
- [ ] M12 — Optional bonus: reconcile FSM naming, implement SituationshipAnalyzer and test timers/cleanup on a dedicated commit. Do not delay required homework submission for this bonus.

### HW1 branch: Production Studio Drum Kit

- [ ] H1-01 — Create `hw1/drum-kit` from the verified exercise base; record branch scope and HW1 acceptance checks.
- [ ] H1-02 — Implement pad data, sound engine and physical `KeyboardEvent.code` mapping for W/A/S/D/J/K/L; guard repeats and typing focus. Commit after focused tests.
- [ ] H1-03 — Add accessible pad buttons, `aria-pressed`, polite hit history and visual dB meter. Commit after browser checks.
- [ ] H1-04 — Verify listener cleanup, keyboard workflow, sound behavior, responsive layout and Lighthouse. Record `docs/verification/HW1_VERIFICATION.md`; commit evidence and fixes separately.
- [ ] H1-05 — Update task status and AI audit with observed issues; push branch and verify remote HEAD.

### HW2 branch: Polyphonic Piano

- [ ] H2-01 — Create `hw2/piano-queue` from the verified exercise base; define keyboard, voice and replay contracts.
- [ ] H2-02 — Generate A0–C8 with 88 keys (52 white/36 black); validate MIDI and frequency calculation. Commit.
- [ ] H2-03 — Implement Web Audio voices, envelope, eight-voice limit and FIFO stealing; verify stop/unmount cleanup. Commit.
- [ ] H2-04 — Implement accessible piano interaction and pressed-key rendering; use React.memo only where Profiler evidence supports it. Commit.
- [ ] H2-05 — Add FIFO recording and 0.5x/1x/2x abortable replay. Test stop and unmount races. Commit.
- [ ] H2-06 — Verify audio, browser, keyboard, performance and responsive behavior; record `docs/verification/HW2_VERIFICATION.md`, audit findings, task status and remote HEAD in separate commits.

### HW3 branch: PUBG VN Arena

- [ ] H3-01 — Create `hw3/pubg-arena` from the verified exercise base; define countdown, claim and feed contracts.
- [ ] H3-02 — Implement epoch-based countdown with `visibilitychange` recovery and timer cleanup. Commit after deterministic timer checks.
- [ ] H3-03 — Implement optimistic claim, in-flight lock, simulated 409 conflict and rollback. Commit after race checks.
- [ ] H3-04 — Add TE/CES/GE/AGG leaderboard and kill feed with immutable filter/sort and VND formatting. Commit.
- [ ] H3-05 — Verify full browser workflow, keyboard use, responsive layout and Lighthouse; record `docs/verification/HW3_VERIFICATION.md`, audit findings, task status and remote HEAD in separate commits.

## Verification and audit rules

1. Use a focused test before each implementation commit, then rerun the relevant baseline when shared code changes.
2. Record command, environment, tested commit, observed result and limitations. A passing unit test does not prove screen-reader behavior or audio quality.
3. Capture genuine bugs during implementation with the failing behavior, cause, correction, test and commit in `AI_FAILURE_AUDIT.md`. Do not invent failures to meet a slide count.
4. Review `git diff --check`, `git status` and commit history before each push. Never commit secrets or temporary files.
5. After a final push, compare local and remote branch commit IDs before marking submission complete.

## Progress and evidence log

| Task | Status | Evidence | Commit |
| --- | --- | --- | --- |
| M01 | Complete | 35 PDF pages reviewed in text and rendered form; ambiguities and branch plan recorded | This commit |
| M02–M12 | Not started | — | — |
| H1-01–H1-05 | Not started | — | — |
| H2-01–H2-06 | Not started | — | — |
| H3-01–H3-05 | Not started | — | — |

## Definition of done

- [ ] All required exercises and three homework branches have verified implementations.
- [ ] Each branch has matching task status, README/run instructions, verification report and honest audit evidence.
- [ ] Applicable manual accessibility and browser checks are recorded without overstating automated scores.
- [ ] Every branch is pushed and its remote commit matches the intended submission.

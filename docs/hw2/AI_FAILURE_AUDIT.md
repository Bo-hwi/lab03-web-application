# HW2 AI Failure Audit

## Current evidence

Prepared 2026-11-11 (Asia/Saigon); updated after the approved H2-T2 implementation and audit checkpoint.
Verified, reproducible HW2 AI-generated failures recorded: **0**.
Evidence gap against a three-failure target: **3**. This is a truthful gap, not an instruction to manufacture bugs.
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
| H2-T2 | REVIEWED - awaiting Senior Review | 0 | 23/23 focused tests, 42/42 full suite; lint/build/diff checks exit 0; implementation c52d471ef07efbe0bff6277af1d983c6013f10ce |
| H2-T3 | NOT STARTED | Not assessed | No implementation |
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

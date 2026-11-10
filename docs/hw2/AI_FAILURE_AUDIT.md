# HW2 AI Failure Audit

## Current evidence

Prepared 2026-11-11 (Asia/Saigon). No HW2 implementation has been generated in this planning phase.
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
| H2-T1 | NOT STARTED | Not assessed | Awaiting senior approval |
| H2-T2 | NOT STARTED | Not assessed | No implementation |
| H2-T3 | NOT STARTED | Not assessed | No implementation |
| H2-T4 | NOT STARTED | Not assessed | No implementation |
| H2-T5 | NOT STARTED | Not assessed | No implementation |
| H2-T6 | NOT STARTED | Not assessed | No implementation |
| H2-T7 | NOT STARTED | Not assessed | No implementation |

## Reference risks excluded from the failure count

Slide 28's standalone PolyphonicSynth calls noteOff without defining it; slide 27's sample PianoKey only handles pointer down/up. These are source-audit findings, not observed failures generated while implementing this homework. They motivate tests but do not satisfy the AI failure quota.

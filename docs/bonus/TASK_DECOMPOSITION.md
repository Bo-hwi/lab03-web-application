# Optional bonus — Hẹn Hò Nhưng Không Yêu

Source: Lab 3 PDF slides 31–32. This is separate from mandatory HW1–HW3. The implementation uses a standalone `/bonus.html` entry so the main App can be used separately.

| Task | Scope | Acceptance | Proposed student commit |
| --- | --- | --- | --- |
| B-T1 | Strict relationship FSM, immutable effort signals, pure derived scores | Only valid transitions; no contradictory dating/love booleans; old snapshots unchanged | `feat(bonus): model situationship state and effort signals` |
| B-T2 | Abortable 3-second ghosting wait and React effect cleanup | Timeout exits only the current pending message; reply, phase change and unmount clear timer/listener | `feat(bonus): add cancellable ghosting timer` |
| B-T3 | Standalone accessible UI and responsive CSS Module | Labelled controls, status output, visible state/actions, no page overflow at 375px | `feat(bonus): build situationship analyzer page` |
| B-T4 | Tests and honest evidence/audit | Unit/SSR, lint/build and browser checks with real observations only | `docs(bonus): record verification and failure audit` |

## PDF conflicts and decisions

- Slide 31 prose specifies `STRANGERS | DATING_NO_LOVE | COMMITTED | SELF_RESPECT_EXIT`; its sample type uses `FRIENDS | DATING_NO_LOVE | OFFICIAL_LOVE | GHOSTED_EXIT`. The prose phase names are used as the intended behavior.
- Slides 31–32 describe a 5-second reply timer; the current implementation uses 5 seconds. Effort changes do not restart an active message timer. Effort changes do not restart an active message timer.
- The prose effort example uses Em 100 steps weighted 0.1 versus Ai Đó 1 step weighted 50; example code shows different counts/weights. The UI starts with the prose example, and each subsequent immutable signal uses the same actor weights.
- JavaScript cannot force garbage collection. “Free memory” is implemented as clearing timers, abort listeners and no longer retaining a pending message; no GC event is claimed.
- No external reply service is specified. “Reply received” is a local explicit action; an unanswered message times out after 5 seconds.
- The bonus page is separately available at `/bonus.html`. Following the student's explicit commit request, its implementation and tests were committed as `3f112a1` on `hw3`.

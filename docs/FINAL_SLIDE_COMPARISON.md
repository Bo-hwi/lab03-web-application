# Lab 3 slide comparison — 2026-11-12

Source: the 35-slide Lab 3 PDF in the repository root. This report describes the current **uncommitted** `hw3` working tree at `4195b26`, including the integrated HW1, HW2, HW3 and optional bonus. The separate `hw2` branch remains untouched. `AGENTS.md` and `project-rules.md` prohibit agent commits.

| Slide | Requirement | Current implementation and evidence | Remaining limit |
| --- | --- | --- | --- |
| 26 | Seven physical W A S D J K L drum pads, keydown/up, repeat and editable guards, button pressed state, live hit output, visual meter | `DrumMachine`, `useDrumKeyboard` and `drumSynth`; Node tests and the HW1 Chromium test exercise the key and focus guards. [375px measurement](hw1/evidence/hw1-375.json) and [screenshot](hw1/evidence/hw1-375.png). | Human listening, Vietnamese IME, screen reader and Lighthouse score have not been independently measured. The meter estimates level from the selected pad gain; it does not measure output audio. |
| 27–28 | Algorithmic A0–C8 keyboard, 8 Web Audio voices with FIFO stealing, ADSR, immutable `{midi,freqHz,durationMs,deltaMs}` recording, 0.5/1/2× replay, Stop and cleanup, memoized keys | `GrandPiano88` imported from the `hw2` branch into the current working tree; its Node suite passes. A fresh Chromium test confirms 88 rendered keys and a recorded/replayed A4. Earlier HW2 evidence is in [verification](hw2/VERIFICATION.md). | Integrated browser test covers one note at 2×; earlier HW2 evidence covers the other speeds, voice stealing and render isolation. Screen reader and real multi-touch remain unverified. |
| 29–30 | Epoch based drop countdown, VIP/crate VND prices, optimistic stock and 409 rollback, leaderboard and kill feed with WWCD/placement/kills | `KraftonPubgVnArena`; Node and Chromium tests cover drop opening after 20 seconds, claims, filtering and 375px. [Measurement](hw3/evidence/hw3-375.json) and [screenshot](hw3/evidence/hw3-375.png). Squad name Roy Esports follows slide 29 prose; slide 22's earlier Genius Esports example remains in the in-class exercise. | The server is a local simulation because no endpoint was specified. Background-tab wake, screen reader and Lighthouse score remain unverified. |
| 31–32 (optional) | Four-state relationship FSM, effort values 0.1 and 50, five-second ghost timeout and cancellation | `SituationshipAnalyzer` uses the slide's five-second value; Node and Chromium tests cover expiry, early reply, effort and restart. [Measurement](bonus/evidence/bonus-375.json) and [screenshot](bonus/evidence/bonus-375.png). | Slide prose and sample types disagree on state names; implementation follows prose. Browser unmount, screen reader and Lighthouse remain unverified. |
| 3, 8, 25, 34 | React 19 rules, semantic markup, 375px, accessibility and evidence, 6–8 atomic commits | `npm.cmd test`: 98/98; `npm.cmd run test:e2e`: 8/8; lint/build exit 0; three Chromium pages measure 375px without horizontal overflow. | Lighthouse Accessibility 100 has not been measured on the final integrated page. Current branch has uncommitted changes, and the policy requires the student to make commits. |
| 30, 34 | Three genuine AI failures with DevTools/verification proof | One reproducible generated HW3 failure and one generated bonus failure are recorded in their respective audits. | Slide 30 specifically asks for three caught during HW3. Only one genuine HW3 failure has been observed; two are an evidence gap. Do not invent them. |

## Current command evidence

- Windows Node test runner: 98 passed, 0 failed (`npm.cmd test`).
- Playwright Chromium `158.0.8127.18`: 8 passed, 0 failed (`npm.cmd run test:e2e`). The browser test captured real 375 × 812 CSS pixel screenshots and width measurements on the integrated App and bonus page.
- `npm.cmd run lint`: exit 0. `npm.cmd run build`: exit 0, Vite 7.3.7, 75 transformed modules.
- `git diff --check`: exit 0 on tracked files. The current new/untracked files are outside that Git check.

## Before submission

Run Lighthouse on the final integrated page and save the real report; complete a keyboard and screen reader pass, real audio listening and background-tab wake check. Review and stage only intended source, test, evidence and documentation files. Keep the assignment PDF and unrelated untracked file out of commits. The student must create the required atomic commits manually under the current policy. The HW3 AI-failure requirement cannot be truthfully marked complete unless two more genuine failures are discovered and reproduced.

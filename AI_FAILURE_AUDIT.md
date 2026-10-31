# Exercise 2 AI Failure Audit

## Scope and evidence

- Exercise: Scientist & Pioneer Directory on branch `ex2`.
- Evidence: `src/components/ScientistDirectory.jsx`, `src/data/smartPeople.js`, `TASK_DECOMPOSITION.md`, and `docs/verification/EXERCISES_VERIFICATION.md`.
- This audit records observed defects and verification gaps. It does not claim that an automated check proves screen-reader behavior or render performance.

## Finding 1: Keyboard focus was lost after deletion

- **Observed failure:** Deleting Johann Goethe removed the focused Delete button and left focus on the page body. This interrupted keyboard navigation.
- **Cause:** The first delete implementation updated the people array without choosing a focus destination before React removed the button.
- **Correction:** Capture the next visible row's Delete button, fall back to the previous row, then to Reset list. Apply the immutable deletion and focus the surviving target after the DOM update.
- **Verification:** In the browser, deleting Johann Goethe changed the count from six to five and focused Delete Albert Einstein. Deleting the only visible result displayed the empty state and focused Reset list.
- **Lesson:** A correct state transition can still break interaction when it removes the active element. Review focus after every destructive UI action.

## Finding 2: The live count used plural wording for one result

- **Observed failure:** The initial status text used `pioneers` for every count, including one.
- **Cause:** The result message was assembled without a singular case.
- **Correction:** Render `pioneer` when the visible count is one and `pioneers` otherwise.
- **Verification:** Searching for Albert Einstein displayed `Found 1 pioneer`; deleting that result displayed the zero-result state.
- **Lesson:** Test live status text at zero, one, and multiple results, not only the default list.

## Finding 3: Passing build and lint did not cover the slide's interaction checks

- **Risk:** Build, lint, and the existing automated tests could be mistaken for complete Exercise 2 acceptance evidence. The current automated suite covers DeveloperCard, not the Scientist Directory's user workflow.
- **Response:** Browser checks were added for deletion focus, reset with an active query, minimum IQ filtering, age ordering, and horizontal overflow at 375px. The verification report separates these observations from untested criteria.
- **Remaining checks:** Actual screen-reader announcements and the single-render-pass checkpoint in React DevTools Profiler have not been measured. They remain unverified until observed directly.
- **Lesson:** State the scope of each test and leave unmet checks open rather than treating a passing build as full acceptance.

## Review controls used

1. Compare each Exercise 2 requirement with the implemented controls and state transitions.
2. Inspect list keys and source-data updates for stable IDs and immutability.
3. Exercise zero, one, and multiple results through the browser, including keyboard focus after deletion.
4. Run build, lint, existing tests, and `git diff --check`; record the limits of each result.
5. Commit only the reviewed change and its matching task and verification notes.

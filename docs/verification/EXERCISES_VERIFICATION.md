# In-Class Exercises Verification

## Environment

- Date: 2026-10-30 (Asia/Ho_Chi_Minh).
- React 19 via the project lockfile; Vite 7.3.7; Node 26.12.1.
- Commands run from the repository root.

## Exercise 1 — semantic component

- `node --test tests/developer.test.js`: 2 passed, 0 failed.
- `npm run build`: passed.
- Server-rendered checks cover article/header/definition list/skills list, absence of div inside the card, explicit avatar dimensions and HTTPS source.
- M04 browser checks at 375 px: page scroll width equaled viewport width (375 px); Tab moved from Developer Card to Scientist Directory and the focused link had a solid 2.4 px computed outline.
- The dedicated browser fixture `tests/developer-fallback-test.html` supplied an invalid image data URL. The image was removed and the visible initials `BH` appeared; the fixture also had no horizontal overflow at 375 px.
- M04 rerun: `node --test tests/developer.test.js` passed 2/2 and `npm run build` passed. Manual screen-reader announcement checks remain pending for later integrated review.
- An initial test assumed the HTML string began directly with `<article>`; React 19 emitted an image preload link first. The assertion was corrected to inspect the article element in the output.

## Exercise 1 responsive check (current component)

- The student confirmed that the layout meets the requirements at 375px and 1440px, including no horizontal scrolling.
- The Vite production build passed after the CSS module was added.

## Exercise 2 — Scientist Directory (2026-10-31)

- Branch: ex2.
- Stop 1, commit 0d6e421: SMART_PEOPLE contains six records with stable IDs sp-1 through sp-6; the first directory version rendered a static list keyed by ID. The production build passed.
- Stop 2, commit cf51d64: labelled search, minimum-IQ and sort controls were added. The visible list is derived during render with filter() and toSorted(). The production build passed. At that point the lint script had not yet been defined.
- Lint setup, commit 07ac37f: ESLint was added; npm run lint and npm run build passed.
- Stop 3, commit 917e9a0: deletion filters the local people array by ID; Reset copies the original SMART_PEOPLE list without changing query, minimum IQ or sort state. The output announces "Found N pioneers", and an empty-state message appears for zero visible results.
- After Stop 3: npm run build passed; npm run lint passed; npm test passed 2/2 existing DeveloperCard tests. The search for useEffect in src/components/ScientistDirectory.jsx found no matches.
- Browser interaction check on 2026-10-31 at `http://127.0.0.1:5173/`: deleting Johann Goethe moved keyboard focus to the next visible Delete button and changed the result count from 6 to 5. Filtering to Albert Einstein and deleting the only visible result showed the empty state and moved focus to Reset list. Reset restored Albert Einstein while keeping the search query. The singular count displayed "Found 1 pioneer".
- Minimum IQ 200 yielded three people. Age ascending displayed William Sidis, Albert Einstein, then Johann Goethe. At a 375px viewport, the document scroll width was 375px, so the page had no horizontal overflow.
- `npm run build` and `npm run lint` passed after the focus fix; the source contains no `useEffect`, `<div>`, or `http://` in ScientistDirectory.jsx. The existing automated suite still covers DeveloperCard only. Actual screen-reader announcements and React DevTools render-pass count remain unverified; the `aria-live` output and stable ID keys were inspected in the browser DOM.
- Exercise 2 failure analysis and outstanding manual checks are recorded in `AI_FAILURE_AUDIT.md`.

## Exercise 3 — PUBG Vietnam Series telemetry (step 1, 2026-10-31)

- Branch: ex3, based on the completed ex2 branch.
- Three stable squad IDs (ces, te, ge) and matching same-origin JSON response files were added. Erangel and Miramar simulate 35% packet loss; Taego remains reliable in the simulation.
- PubgMatchTelemetry models IDLE, LOADING, SUCCESS and ERROR. Selecting another squad unmounts the old request view, and effect cleanup aborts its AbortController. Aborted responses cannot update the visible squad.
- The initial loading and error views are deliberately plain in this commit. The fixed-height skeleton, accessible retry control and responsive styling belong to the next task.
- npm run build: passed. npm run lint: passed. npm test: 6 passed, 0 failed (including four telemetry service tests).
- Browser interaction, Slow 3G, 375px layout, screen-reader behavior and visual stability remain to be checked after the UI task.

## Exercise 3 — skeleton and retry (step 2, 2026-10-31)

- The LOADING view reserved a 220px skeleton card, confirmed from the browser element bounds. Its pulse animation is disabled when reduced motion is requested.
- At a 375px browser viewport, the document scroll width was 360px, so there was no horizontal overflow in the Exercise 3 view.
- Rapid switching between Cerberus Esports and The Expendables was exercised in the browser. A simulated Erangel packet loss produced a visible role=alert error and the Reconnect Satellite (Retry) button.
- Activating Retry immediately returned the view to LOADING, then displayed the Cerberus Esports Erangel telemetry. The 35% packet loss may cause a later retry to fail again.
- npm run build, npm run lint and npm test passed after the UI change. The test suite contains six passing tests, including four telemetry service tests.
- This browser check did not record a numeric Cumulative Layout Shift score, Slow 3G profile or screen-reader announcement. The student's subsequent manual verification is recorded below.

## Exercise 3 — student manual verification (2026-10-31)

- The student confirmed that they completed the remaining Slow 3G, visual stability/CLS and screen-reader announcement checks for Exercise 3 and found the behavior satisfactory.
- This entry records the student's confirmation. The exact numeric CLS value, throttling settings and screen-reader announcement wording were not provided, so no measurement or transcript is claimed here.

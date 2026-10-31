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
- The existing automated test suite covers DeveloperCard only. Exercise 2 search, sorting, deletion, Reset and live announcements have not yet been verified through browser interaction or a screen reader. The Stop 3 behavior above is based on source review and successful build/lint, not a completed interaction audit.

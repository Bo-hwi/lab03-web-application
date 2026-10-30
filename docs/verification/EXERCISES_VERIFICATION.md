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


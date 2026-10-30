# In-Class Exercises Verification

## Environment

- Date: 2026-10-30 (Asia/Ho_Chi_Minh).
- React 19 via the project lockfile; Vite 7.3.7; Node 26.12.1.
- Commands run from the repository root.

## Exercise 1 — semantic component

- `node --test tests/developer.test.js`: 2 passed, 0 failed.
- `npm run build`: passed.
- Server-rendered checks cover article/header/definition list/skills list, absence of div inside the card, explicit avatar dimensions and HTTPS source.
- Browser checks for avatar fallback, keyboard focus and 375 px layout remain pending in M04.
- An initial test assumed the HTML string began directly with `<article>`; React 19 emitted an image preload link first. The assertion was corrected to inspect the article element in the output.

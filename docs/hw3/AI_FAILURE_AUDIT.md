# HW3 AI failure audit

Record only genuine generated-code failures with the prompt/code provenance, reproducible steps, actual expected-versus-observed output, correction, regression evidence and real fix hash if a student commit exists. Slide 30 asks for at least three verified AI-generated bugs caught while building HW3; disclose the evidence gap if fewer are found. Reference-code omissions and deliberately injected 409 responses do not count.

## Failure #01 — Generated filter wrapper violated semantic markup rule

- Provenance: AI-generated `KraftonPubgVnArena.jsx` in the initial HW3 UI implementation on 2026-11-12, before any commit.
- Expected: the arena component has no generic `<div>` wrapper; controls use meaningful structure under the repository rule.
- Actual proof: `node --test tests/hw3-arena.test.js tests/hw3-arena-ssr.test.js` returned 6 passed, 1 failed. The failing SSR assertion reported a `<div class="_controls_bpaxg_39">` around the leaderboard search and sort controls.
- Reproduction: render `KraftonPubgVnArena` through Vite SSR and assert the markup does not contain `<div`.
- Cause: generated JSX grouped two labelled fields with a generic wrapper.
- Correction: use a named `<section aria-label="Leaderboard filters">` for the grouping. Rerun result is recorded in VERIFICATION.md after testing.
- Fix commit: `a9f3612` on `hw3` includes the corrected semantic section.

## Slide 30 evidence gap — 2026-11-12

Slide 30 asks for three genuine AI-generated failures caught during HW3. Only Failure #01 above has reproducible HW3 evidence. The bonus timer bug is a separate bonus finding and must not be relabelled as an HW3 failure. Two HW3 findings remain an evidence gap. No fake bug, screenshot, DevTools trace or fix hash has been added.

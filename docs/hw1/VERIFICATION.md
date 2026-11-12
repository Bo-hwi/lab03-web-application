# Homework 1 — Verification

Record the actual command, browser observation, date and evidence when each check runs. `PENDING (manual)` requires a real browser, DevTools, Lighthouse or student observation. Never mark a row PASS based only on planned behavior.

| Check | How to verify | Expected | Result | Evidence |
| --- | --- | --- | --- | --- |
| Production build | Run `npm run build` after each task. | Command exits 0. | PASS (T1 only; rerun after later tasks) | 2026-10-31: `npm run build` exited 0; Vite built 39 modules. |
| Lint | Run `npm run lint` after each task. | Command exits 0. | PASS (T1 only; rerun after later tasks) | 2026-10-31: `npm run lint` exited 0; ESLint checked `src` and `vite.config.js`. |
| Forbidden code patterns | Search feature source for `keyCode`, `window.alert`, `http://`, `defaultProps`, class components and `<div` abuse in pad components; inspect matches in context. | No forbidden use; semantic elements are used where appropriate. | PENDING | — |
| Seven physical key mappings | In a browser, press W A S D J K L with a Vietnamese IME active if available; inspect the corresponding pad feedback. | `e.code` maps `KeyW`, `KeyA`, `KeyS`, `KeyD`, `KeyJ`, `KeyK`, `KeyL` to the intended pads. | PENDING (manual) | — |
| Held-key repeat guard | Hold each mapped key long enough for key repeat. | One hit per press; `e.repeat` does not retrigger. | PENDING (manual) | — |
| Editable-target guard | Focus an INPUT, TEXTAREA and SELECT, then type mapped keys. | No drum pad is triggered. | PENDING (manual) | — |
| Pad button state | Inspect pad DOM and activate each pad. | Every pad is `<button type="button">`; `aria-pressed` reflects active state. | PENDING (manual) | — |
| Hit history | Trigger several pads and inspect the live region. | `<output aria-live="polite">` updates once per hit. | PENDING (manual) | — |
| Visual decibel meter | Trigger pads and observe the meter. | Meter reacts visibly to each hit and provides non-audio feedback. | PENDING (manual) | — |
| Keyboard-only navigation | Use Tab, Shift+Tab and activation keys without a mouse. | Logical order, visible focus ring and usable controls. | PENDING (manual) | — |
| 375px responsive layout | Set the browser viewport to 375px and compare document scroll width with viewport width. | No horizontal page scrolling. | PENDING (manual) | — |
| Reduced motion | Enable `prefers-reduced-motion: reduce` in DevTools or the OS and trigger pads. | Nonessential motion is removed or reduced. | PENDING (manual) | — |
| Lighthouse Accessibility | Run Lighthouse on the final HW1 page and retain the report. | Accessibility score is 100. | PENDING (manual) | — |
| StrictMode console | Load and interact with the final page under React StrictMode; inspect DevTools Console. | Zero warnings and errors. | PENDING (manual) | — |

## T2 domain-map checkpoint — 2026-11-12 (Asia/Saigon)

- Branch: `hw1/drum-kit` at starting HEAD `4195b26ed903ecffdfdfa5b20f4ed1ca70e0fe4d`; no commit was made by the agent.
- `node --test tests/hw1-drum-pads.test.js`: 2 passed, 0 failed. The tests check the exact seven physical codes, stable unique IDs, lookup identity, unknown-code handling, parameter bounds and immutability.
- `npm.cmd test`: 8 passed, 0 failed. `npm.cmd run lint`: exit 0. `npm.cmd run build`: exit 0, Vite 7.3.7 built 39 modules.
- `src/data/drumPads.js` is pure data and lookup logic. It has not been wired into the app, so browser input, Web Audio output, timbre and accessibility checks remain PENDING for later tasks.
- The seven sound labels and synthesis values are T2 engineering choices for T3, not claimed as exact PDF-prescribed sounds or listening-verified results.

## Integrated checkpoint — 2026-11-12

The older T1/T2 table above is historical. The current uncommitted `hw3` working tree now contains the drum engine, keyboard hook, seven semantic pads, hit history, meter and responsive CSS. `npm.cmd test` passed 98/98, `npm.cmd run test:e2e` passed 8/8, lint and build exited 0. The HW1 Chromium test observed seven buttons; physical W key down/up changing `aria-pressed`; repeated W producing one hit; typing W in a search input producing no hit; Enter on a focused pad adding a hit; the meter present; and zero uncaught `pageerror`. At 375 × 812 CSS pixels the whole App measured `innerWidth=375`, `documentScrollWidth=375`, `bodyScrollWidth=375`. See [measurement](evidence/hw1-375.json) and [screenshot](evidence/hw1-375.png). Human listening, IME, screen reader and Lighthouse Accessibility 100 are still pending. The visual meter is a gain-derived estimate.

## Student manual report — 2026-11-12

The student reported that HW1 and HW2 audio sounded correct, and that the requested keyboard/accessibility controls worked. This is student-reported manual evidence without a recording or screen-reader transcript. The student also reported Lighthouse Accessibility 100 on the main integrated page; no main-page Lighthouse screenshot was supplied in this message. Do not treat either report as agent-observed evidence.

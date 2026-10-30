# Project Rules

- Stack: React 19, Vite, ES2024, JavaScript (JSX), and CSS Modules.
- Use `createRoot` from `react-dom/client` wrapped in `<StrictMode>`.
- Banned: class components, `ReactDOM.render`, `defaultProps` (use ES6 default parameters), `import * as React`, `window.alert`, `keyCode` and `keypress` (use `e.code`), HTTP URLs, `dangerouslySetInnerHTML`, index or primitive-value list keys, and inline style props for theming.
- Avoid div soup. Use semantic `main`, `section`, `article`, `header`, `hgroup`, `dl`, `dt`, `dd`, `ul`, `li`, `figure`, `output`, and Fragment where appropriate. Every button must have explicit `type="button"`.
- Pair every input and select with a `label` using `htmlFor` and an ID from `useId()`. Read number inputs with `e.target.valueAsNumber`.
- Update state immutably using spread, filter, or `toSorted`. Derive filtered and sorted data during rendering instead of storing or syncing it in an effect.
- Clean up every timer, listener, and fetch in `useEffect` using the corresponding cleanup. Keep dependency arrays honest.
- Prevent horizontal scroll at 375px. Define CSS custom properties in `:root`.
- Never run `git commit`; the student commits manually.

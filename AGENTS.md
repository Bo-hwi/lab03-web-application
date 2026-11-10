# Project Rules

- Stack: React 19, Vite, ES2024, JavaScript (JSX), and CSS Modules.
- Use `createRoot` from `react-dom/client` wrapped in `<StrictMode>`.
- Banned: class components, `ReactDOM.render`, `defaultProps` (use ES6 default parameters), `import * as React`, `window.alert`, `keyCode` and `keypress` (use `e.code`), HTTP URLs, `dangerouslySetInnerHTML`, index or primitive-value list keys, and inline style props for theming.
- Avoid div soup. Use semantic `main`, `section`, `article`, `header`, `hgroup`, `dl`, `dt`, `dd`, `ul`, `li`, `figure`, `output`, and Fragment where appropriate. Every button must have explicit `type="button"`.
- Pair every input and select with a `label` using `htmlFor` and an ID from `useId()`. Read number inputs with `e.target.valueAsNumber`.
- Update state immutably using spread, filter, or `toSorted`. Derive filtered and sorted data during rendering instead of storing or syncing it in an effect.
- Clean up every timer, listener, and fetch in `useEffect` using the corresponding cleanup. Keep dependency arrays honest.
- Prevent horizontal scroll at 375px. Define CSS custom properties in `:root`.
- For explicitly approved HW2 implementation tasks only, Codex may create local Git commits after all applicable task verification is completed successfully.
- Create one atomic implementation commit per task. Commit updated verification evidence separately, and updated AI failure audit findings separately. If a category has no file changes, report NO_COMMIT_REQUIRED; never create empty commits.
- Stage only explicitly identified and reviewed task files using explicit paths. Never use `git add .` or `git add -A`. Never include unrelated files, PDFs, secrets, or untracked HW1 files.
- Before each commit, inspect the staged file list and staged diff. If the index contains unrelated staged work, stop without modifying that work.
- Never fabricate verification results, audit findings, or commit hashes. Record actual hashes only after successful commits.
- Never use force push, reset --hard, clean, history rewriting, or other destructive Git operations. Do not push without separate authorization.
- After completing the task's applicable commits, report TASK_ID, VERIFICATION_STATUS, FILES_CHANGED, IMPLEMENTATION_COMMIT, VERIFICATION_COMMIT, AI_AUDIT_COMMIT, and GIT_STATUS; then stop and await Senior Review before the next task.
- This HW2 policy supersedes conflicting manual-commit instructions in docs/hw2 only. Preserve historical records and HW1 instructions. Policy changes require explicit user approval.

# END OF TASK PROTOCOL (Frontend)

Run this protocol before marking any task complete.

## 1. Scope and Boundaries
- Confirm changed files respect module boundaries.
- Confirm no business logic leaked into `app` route files or dumb UI components.

## 2. Type and Build Safety
- TypeScript passes without ignored errors.
- No `any` introduced in critical layers unless justified.

## 3. Data and State Safety
- Query keys and invalidation are scoped correctly.
- No duplicated server state in Zustand/local state without reason.

## 4. UX and Error Safety
- Loading, empty, and error states handled.
- Form/server errors map to actionable messages.

## 5. Security
- No token/secret leak in client code.
- Auth/permission checks present on server boundaries.

## 6. Quality Gate
- Run or document status of: lint, tests, build.
- If checks were skipped, explicitly state why.

## 7. Delivery Note
- Summarize what changed, why, and residual risks.
- Provide next steps only when they are natural and actionable.

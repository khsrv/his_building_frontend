# State Management Rules (Query + Zustand + React)

## 1. State Classification (MANDATORY)
- Server state: TanStack Query.
- URL/shareable state: search params/path segments.
- Local ephemeral state: `useState` / `useReducer`.
- Shared client UI/workflow state: Zustand.

## 2. Zustand Usage
- Create store per domain concern (`auth-ui`, `table-preferences`, etc.).
- Store actions are explicit, typed, and side-effect aware.
- Keep store surface minimal and serializable where possible.

## 3. Data Ownership
- Never treat Zustand as API cache replacement.
- Do not store whole query responses unless absolutely necessary.
- Persist only stable UX preferences/session-safe flags.

## 4. Selectors and Re-renders
- Use selectors to limit re-renders.
- Avoid reading entire store objects in many components.
- Keep derived data memoized near consumers.

## 5. Forbidden
- Business-critical authorization logic in client store only
- Massive global store for unrelated features
- Duplicated state in Query + Zustand + local component state

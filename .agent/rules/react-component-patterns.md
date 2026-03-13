# React Component Patterns Rules

## 1. Component Responsibilities
- Keep components focused: layout, rendering, user interaction.
- Move business decisions to application/domain logic.
- Keep side effects in hooks/effect handlers, not in render branches.

## 2. Composition
- Prefer composition over inheritance/mega-props.
- Extract reusable UI primitives into `shared/ui`.
- Feature-specific components stay inside module presentation.

## 3. Hook Rules
- Hooks encapsulate behavior and expose a minimal API.
- Custom hooks start with `use` and live close to consuming module.
- No conditional hook calls.

## 4. State Placement
- Local transient UI state -> `useState`/`useReducer`.
- Cross-page client state -> Zustand.
- Server state -> TanStack Query (not Zustand copy).

## 5. Events and Handlers
- Keep event handlers thin.
- Validate and normalize payloads before mutation calls.
- Do not mix imperative navigation, mutation, and toast logic in one block.

## 6. Accessibility Basics
- Use semantic elements (`button`, `form`, `label`, `table`).
- Keyboard and focus behavior must be explicit for dialogs/menus.

## 7. Forbidden
- Network requests directly in presentational components
- Business policy in JSX conditions
- Copying query data into local state without explicit reason

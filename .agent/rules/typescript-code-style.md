# TypeScript Code Style Rules

## 1. Compiler Strictness (MANDATORY)
- `strict: true`
- `noUncheckedIndexedAccess: true`
- `exactOptionalPropertyTypes: true`
- `noImplicitOverride: true`
- `useUnknownInCatchVariables: true`

## 2. Typing Rules
- No `any` unless explicitly justified in comment.
- Prefer `unknown` + narrowing over unsafe casting.
- Avoid `as unknown as T`.
- Prefer discriminated unions for async/result states.
- Public function boundaries must be explicitly typed.

## 3. Domain and Contracts
- Domain types are immutable by default (`readonly` where useful).
- Use branded/value types for critical IDs when needed.
- Keep API contract types separated from domain entities.

## 4. Enums and Literals
- Prefer union literals over `enum` for web payloads.
- Keep constant sets in `as const` objects where possible.

## 5. Nullability
- Model optional and nullable values intentionally.
- Do not hide nullability with non-null assertions (`!`) in app logic.
- Handle nullable branches explicitly near input boundaries.

## 6. Error Modeling
- Throw/return typed domain errors from application layer.
- Map transport errors to known application errors in infrastructure.

## 7. Forbidden
- `any` in domain/application layers
- Implicit `any` in callbacks or event handlers
- Type assertions as a substitute for validation

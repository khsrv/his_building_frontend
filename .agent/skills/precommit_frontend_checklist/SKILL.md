---
name: precommit_frontend_checklist
description: Use this skill when reviewing changes before commit/PR to enforce frontend architecture, typing, auth safety, UI quality, and regression checks.
---

# Pre-commit Frontend Checklist

## Goal
Catch risky issues before commit/PR with a fast, strict check.

## Checklist
### Architecture
- Module boundaries respected
- No business logic in route files or dumb UI components
- DTO/domain/view-model separation preserved

### Types and Contracts
- No unsafe `any` in critical layers
- Query keys remain stable and scoped
- Form schemas aligned with payload contracts

### Security
- No secret/token leakage in client code
- Auth guards and permission checks preserved server-side

### UX
- Loading/empty/error states implemented
- Form errors mapped correctly
- A11y basics not regressed

### Verification
- Typecheck, lint, tests, build executed or explicitly reported as skipped
- Regression test added for bug fixes when feasible

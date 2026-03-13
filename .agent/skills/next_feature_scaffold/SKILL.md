---
name: next_feature_scaffold
description: Use this skill when implementing a new frontend feature/module in Next.js with strict modular architecture, typed contracts, TanStack Query, and optional RHF+Zod forms.
---

# Next Feature Scaffold

## Goal
Create a feature with clean boundaries and minimal production-ready boilerplate.

## Steps
1. Create module skeleton:
```txt
src/modules/<feature>/
  domain/
  application/
  infrastructure/
  presentation/
```

2. Define contracts first:
- Domain entities/policies/errors
- Application ports/use-cases
- Infrastructure DTO/mappers/client methods
- UI state model (`loading/empty/error/success`)

3. Implement data flow:
- Add query key factory
- Add query/mutation hooks in presentation or module hooks layer
- Keep API calls in infrastructure only

4. Implement UI:
- Route-level page composes feature component
- Feature component handles states and user events
- Use design-system components only
- Reuse existing starter components before creating new primitives

5. Add validation path if form exists:
- Zod schema + RHF integration
- Map backend field errors to form errors

6. Verify:
- Type-safe contracts
- Loading/empty/error states
- No DTO leakage into UI
- No duplicated primitive if equivalent exists in `shared/ui`

## Output Format
- File tree
- Key contract snippets
- Hook/mutation snippets
- Route integration snippet

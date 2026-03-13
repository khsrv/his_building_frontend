---
name: forms_rhf_zod
description: Use this skill for building or refactoring forms with React Hook Form and Zod, including schema-first typing, field-level error mapping, and robust submit flows.
---

# Forms with RHF + Zod

## Goal
Deliver type-safe, UX-safe forms with predictable validation and error handling.

## Steps
1. Define schema:
- Create `*.schema.ts`
- Export `FormValues = z.infer<typeof schema>`

2. Build form contract:
- Set complete `defaultValues`
- Define required/optional/null fields explicitly

3. Wire submit flow:
- `handleSubmit` -> normalize -> mutation
- Map backend validation errors to fields
- Show non-field errors in form-level alert area

4. UX safety:
- Disable submit while pending
- Preserve user input on failure
- Focus first invalid field on submit error

5. Final checks:
- No duplicated validation logic
- No uncontrolled field drift
- Accessible labels/errors/aria

# Forms and Validation Rules (React Hook Form + Zod)

## 1. Schema-First Contract
- Every non-trivial form has a Zod schema.
- Form values type is inferred from schema (`z.infer`), not duplicated manually.
- Validation rules are centralized in schema/domain policies.

## 2. Form Composition
- Keep forms modular: sections + reusable field components.
- Use `FormProvider` for deep nested forms when needed.
- Keep default values explicit and complete.

## 3. Submit Flow
- `handleSubmit` -> normalize payload -> call mutation -> map errors.
- Disable repeated submits while pending.
- Server field errors must map back to specific form fields.

## 4. UX Rules
- Show inline field errors and top-level submit errors separately.
- Preserve user input on failed submit.
- Use optimistic reset only when business flow allows it.

## 5. Accessibility
- Every field has label, helper/error text, and correct `aria` attributes.
- Error summary/focus management for long forms.

## 6. Forbidden
- Duplicating validation in multiple places without reason
- Form state mirrored manually in `useState` for each field
- Silent submit failures without user feedback

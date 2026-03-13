# UI Design System Rules (MUI-First Admin + Tailwind Utility Layer)

## 1. Design Tokens First
- Colors, spacing, radius, typography go through tokens/CSS variables.
- No random hex values or magic spacing in feature components.
- Keep dark/light and brand variants token-driven.

## 2. Component Layering
- Base primitives in `shared/ui` (`App*` wrappers, MUI internals for admin).
- Feature components compose primitives; they do not fork design-system internals.
- Prefer extension by composition instead of cloning primitives.
- Reuse starter primitives before introducing any new UI primitive (`starter-reuse-first.md`).

## 3. Tailwind Discipline
- Utility classes are allowed, but avoid unreadable class chaos.
- Extract repeated class logic into utility functions or wrapper components.
- Keep responsive and state variants explicit.

## 4. Visual Consistency
- Use one design language per app area.
- For admin modules, MUI is default and should not be mixed with another heavy UI library.

## 5. Accessibility
- Color contrast, focus visible styles, keyboard navigation are mandatory.
- Dialogs, popovers, dropdowns must have focus trap and escape behavior.

## 6. Forbidden
- Inline style objects for static design tokens
- Ad-hoc new button/input variants outside design-system contract
- Copy-paste UI patterns with inconsistent spacing/typography

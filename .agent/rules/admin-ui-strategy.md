# Admin UI Strategy (MUI vs Ant Design vs Base Stack)

## 1. Base Stack (Default)
- Next.js + TypeScript + Tailwind + shadcn/ui
- TanStack Query + React Hook Form + Zod + Zustand
- TanStack Table for most admin grids

## 2. When to Choose MUI
Choose MUI if:
- Need fast assembly of classic admin pages
- Need many ready components with minimal custom design effort
- Team prefers Material ecosystem and existing templates

## 3. When to Choose Ant Design
Choose Ant Design if:
- Product is dense B2B/CRM/ERP/operations UI
- Table/form/filter workflows are dominant
- Enterprise visual language is preferred

## 4. Selection Rule
- Select one primary heavy UI library per admin area.
- Do not mix MUI and Ant Design in the same module unless migration is in progress.
- Keep shared auth/layout/query/form contracts independent from chosen UI library.

## 5. Grid Strategy
- TanStack Table: default for custom control and moderate complexity.
- AG Grid: for very large enterprise grids (grouping, pivoting, bulk ops, virtualization-heavy workflows).

## 6. Non-Negotiables
- Architecture boundaries stay the same regardless of UI library.
- Validation and API contracts remain schema-driven.
- Access control and audit-critical actions must be server-validated.

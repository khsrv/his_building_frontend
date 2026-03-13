# Performance and Accessibility Rules

## 1. Rendering Strategy
- Keep routes server-rendered by default where possible.
- Limit client boundaries to interactive islands.
- Avoid large client bundles in root layout.

## 2. Bundle and Runtime
- Lazy-load heavy editors/charts/modals.
- Use route-level code splitting naturally with App Router.
- Track bundle size regressions in CI when possible.

## 3. List and Table Performance
- Virtualize large lists/tables.
- Use cursor pagination for heavy datasets.
- Avoid expensive derived computations in render path.

## 4. Network Performance
- Debounce search filters.
- Cancel stale requests.
- Use cache policies intentionally; avoid accidental refetch storms.

## 5. Core Web Vitals Baseline
- Track LCP, INP, CLS on critical routes.
- Investigate regressions before feature expansion.

## 6. Accessibility Baseline
- Semantic landmarks (`main`, `nav`, `header`, `footer`).
- Full keyboard operability for interactive controls.
- Focus management after dialogs/navigation/submits.
- Form errors announced and programmatically associated.

## 7. Forbidden
- Blocking UI with unnecessary synchronous work
- Infinite rerenders due to unstable dependencies
- Releasing inaccessible admin workflows

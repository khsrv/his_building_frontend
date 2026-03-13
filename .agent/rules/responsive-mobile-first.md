# Responsive and Mobile-First Rules

## 1. Strategy
- Build mobile-first first, then scale to tablet/desktop.
- Start with base styles, then expand with `sm`, `md`, `lg`, `xl` breakpoints.
- Do not design desktop-only and then patch mobile later.

## 2. Layout Contracts
- Use fluid containers and consistent spacing tokens.
- Avoid fixed pixel widths for core content blocks.
- Critical actions must remain reachable on small screens.

## 3. Navigation and Interaction
- Touch targets must be large enough for mobile use.
- Menus/dialogs/tables must be keyboard accessible on desktop and usable by touch on mobile.
- Dense data tables must have mobile fallback (stacked cells, horizontal scroll, or alternate card mode).

## 4. Performance on Mobile
- Avoid heavy client bundles on initial mobile route load.
- Lazy-load large charts/editors and non-critical widgets.
- Keep input/filter interactions debounced where needed.

## 5. Testing Requirements
- Validate core routes in at least 3 viewport classes: mobile, tablet, desktop.
- Verify no overflow, clipped dialogs, or unreachable CTA in mobile portrait.
- Verify font size/contrast/focus visibility in both themes.

## 6. Forbidden
- Horizontal page overflow on primary routes
- Hidden primary actions on small viewports
- Breakpoint-specific behavior without tests

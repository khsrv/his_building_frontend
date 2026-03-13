---
name: responsive_mobile_first
description: Use this skill when implementing or fixing adaptive UI behavior across mobile/tablet/desktop, including layout, table fallback, navigation ergonomics, and breakpoint-safe interactions.
---

# Responsive Mobile-First

## Goal
Guarantee reliable UX on small screens first and preserve quality on larger screens.

## Steps
1. Define viewport contract:
- Mobile: <= 767px
- Tablet: 768px - 1023px
- Desktop: >= 1024px

2. Implement mobile-first layout:
- Start from base styles without breakpoints
- Add `md` and `lg` enhancements progressively

3. Validate interaction safety:
- Touch-friendly controls
- No clipped dialogs
- Primary actions always visible

4. Data-dense screens:
- Add mobile fallback for wide tables (horizontal scroll, stacked cells, or cards)
- Keep filter/actions reachable in mobile view

5. Verification:
- Test key routes in all 3 viewport classes
- Verify no overflow, no hidden CTA, no broken focus behavior

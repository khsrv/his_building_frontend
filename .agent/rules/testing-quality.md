# Testing and Quality Rules

## 1. Test Pyramid
- Unit tests: domain/application logic and pure utilities.
- Integration tests: API client adapters, query hooks, form submit flows (with mocks/MSW).
- E2E tests: critical user journeys (auth, CRUD, permission boundaries).

Target distribution:
- ~70% unit
- ~20% integration
- ~10% e2e

## 2. Mandatory Checks for Delivery
- `typecheck` must pass.
- `lint` must pass.
- `test` must pass for affected scope.
- `build` must pass for production profile.

## 3. What Must Be Tested
- Domain rules and edge cases.
- Query hook success/error/loading handling.
- Form validation + backend error mapping.
- Admin table filtering/sorting/pagination behavior.
- Responsive behavior on mobile/tablet/desktop for changed routes.

## 4. Contract Safety
- Parse backend responses with schemas at boundaries when feasible.
- Detect contract drift early via integration tests.

## 5. Review Discipline
- Bug fix requires regression test in the closest reliable layer.
- Refactor requires behavior-preserving checks.

## 6. Forbidden
- Shipping critical flow changes with zero automated checks
- Snapshot-only strategy for logic-heavy components
- Ignoring flaky tests without root-cause analysis
- Shipping layout changes without mobile viewport verification

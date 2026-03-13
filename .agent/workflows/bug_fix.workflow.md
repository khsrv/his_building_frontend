---
description: Minimal, targeted bug fix with regression safety
---

id: bug_fix_workflow
type: corrective
goal: Fix the issue with the smallest safe change and add regression protection

trigger:
  - bug
  - regression
  - broken_behavior

steps:
  - reproduce:
      output:
        - expected_behavior
        - actual_behavior
        - scope_of_impact

  - isolate_layer:
      options:
        - routing
        - presentation
        - application
        - infrastructure
        - auth_session

  - implement_minimal_fix:
      constraints:
        - no_unrelated_refactor
        - preserve_public_contracts_when_possible

  - add_regression_check:
      output:
        - unit_or_integration_test
        - manual_repro_check_if_test_not_feasible

  - verify:
      checklist:
        - no_new_type_errors
        - no_new_accessibility_break
        - no_query_cache_regression

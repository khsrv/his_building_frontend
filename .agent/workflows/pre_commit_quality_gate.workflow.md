---
description: Fast but strict quality gate before commit or PR
---

id: pre_commit_quality_gate
type: gate
goal: Catch architecture, type, quality, and UX regressions before merge

trigger:
  - before_commit
  - before_pr
  - code_review_request

steps:
  - architecture_check:
      checklist:
        - module_boundaries_respected
        - no_business_logic_in_route_files
        - dto_domain_ui_models_separated
        - starter_components_reused_when_available
        - no_parallel_duplicate_primitives_in_modules

  - technical_check:
      checklist:
        - typecheck_pass
        - lint_pass
        - tests_for_changed_surface
        - build_pass_or_documented_reason

  - product_check:
      checklist:
        - loading_empty_error_states_present
        - auth_role_rules_not_bypassed
        - accessibility_basics_hold
        - mobile_tablet_desktop_smoke_check
        - no_horizontal_overflow_on_primary_routes

  - delivery_note:
      output:
        - risk_summary
        - follow_up_items_if_any

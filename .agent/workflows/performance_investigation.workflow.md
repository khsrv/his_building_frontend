---
description: Evidence-driven frontend performance investigation workflow
---

id: performance_investigation_workflow
type: diagnostic
goal: Find bottlenecks first, optimize second

trigger:
  - slow_page
  - rerender_issue
  - bundle_growth
  - web_vitals_regression

steps:
  - capture_baseline:
      output:
        - route_and_user_action
        - before_metrics
        - reproduction_steps

  - classify_bottleneck:
      options:
        - network
        - render
        - bundle
        - hydration
        - list_table_scale

  - apply_targeted_fix:
      examples:
        - query_cache_tuning
        - memoization_and_selector_fix
        - dynamic_import
        - virtualization
        - remove_unneeded_use_client

  - validate_result:
      output:
        - after_metrics
        - regression_risk_notes

forbidden:
  - optimization_without_measurement
  - broad_refactor_disguised_as_perf_fix

---
description: Refactor safely without behavior change
---

id: refactor_safely_workflow
type: maintenance
goal: Improve structure/readability without product behavior drift

trigger:
  - refactor
  - cleanup
  - technical_debt

steps:
  - define_refactor_boundary:
      output:
        - files_in_scope
        - behavior_contract_to_preserve

  - split_in_small_steps:
      constraints:
        - one_intent_per_step
        - keep_code_compilable_each_step

  - protect_behavior:
      checklist:
        - existing_tests_green
        - add_missing_tests_for_critical_paths
        - manual_smoke_for_high_risk_ui

  - verify_and_document:
      output:
        - what_changed
        - what_did_not_change

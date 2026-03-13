---
description: Safely apply backend API or DTO contract changes
---

id: data_contract_change_workflow
type: safety
goal: Apply schema and payload updates without breaking current flows

trigger:
  - api_change
  - dto_change
  - payload_change
  - versioning

steps:
  - detect_breaking_surface:
      output:
        - endpoints_affected
        - fields_added_removed_changed
        - backward_compatibility_status

  - update_transport_and_mapping:
      constraints:
        - dto_updates_isolated_in_infrastructure
        - mappers_keep_domain_stable_if_possible

  - update_ui_contracts:
      output:
        - query_hooks_updated
        - form_schema_updated
        - table_columns_filters_synced

  - verification:
      checklist:
        - parse_and_validation_updated
        - contract_regression_tests
        - no_silent_fallbacks_for_required_fields

---
description: Deliver a frontend feature from requirement to ready-to-merge
---

id: feature_delivery_workflow
type: core
goal: Deliver a new feature with strict architecture boundaries and quality checks

trigger:
  - new_feature
  - new_screen
  - new_user_flow

steps:
  - clarify_scope:
      output:
        - business_goal
        - happy_path
        - edge_cases
        - permissions

  - starter_reuse_audit:
      checklist:
        - shared_ui_components_reviewed
        - starter_showcase_reference_checked
        - reuse_map_created_before_new_ui

  - select_skills:
      via: META_skill_router
      required:
        - next_feature_scaffold

  - design_contracts:
      output:
        - route_contract
        - api_contract
        - domain_model
        - ui_states

  - implement_layers:
      constraints:
        - app_layer_is_composition_only
        - business_logic_outside_jsx
        - dto_domain_ui_separation

  - quality_verification:
      checklist:
        - type_safe
        - loading_empty_error_states_present
        - query_keys_scoped
        - forms_schema_validated

  - ready_to_merge: true

forbidden:
  - building_ui_before_contracts_for_complex_flows
  - mixing_transport_dto_into_ui
  - global_state_for_server_data
  - duplicating_existing_shared_ui_primitives_without_gap_note

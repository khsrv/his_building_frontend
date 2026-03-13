---
description: Build a reliable admin module with list/filter/detail/edit and permissions
---

id: admin_module_workflow
type: core
goal: Deliver enterprise-style admin modules without losing architecture quality

trigger:
  - admin_crud
  - dashboard_module
  - table_heavy_flow

steps:
  - define_admin_capabilities:
      output:
        - list_columns
        - filters
        - sort_rules
        - bulk_actions
        - role_permissions

  - starter_reuse_audit:
      checklist:
        - appdatatable_fit_checked
        - actionmenu_and_filter_components_checked
        - editor_or_drawer_reuse_checked

  - choose_ui_path:
      options:
        - tailwind_shadcn
        - mui
        - ant_design
      rule:
        - choose_one_primary_library_per_module

  - implement_data_layer:
      constraints:
        - server_pagination_ready
        - typed_filter_contract
        - query_cache_invalidation_strategy

  - implement_ui_flow:
      output:
        - list_page
        - filter_panel
        - detail_drawer_or_page
        - create_edit_form
        - bulk_actions_confirmation

  - quality_gate:
      checklist:
        - role_checks_client_and_server
        - empty_loading_error_states
        - keyboard_access_for_table_actions
        - no_n_plus_1_requests
        - no_duplicate_admin_primitives_without_documented_gap

---
description: Bootstrap a new frontend project with strict architecture and baseline runtime
---

id: project_bootstrap_workflow
type: bootstrap
goal: Set up a new project skeleton that is architecture-safe from day one

trigger:
  - new_project
  - project_init
  - architecture_bootstrap

steps:
  - confirm_stack:
      output:
        - framework_runtime
        - ui_stack
        - state_stack
        - auth_strategy

  - generate_baseline_structure:
      output:
        - app_router_groups
        - modules_boundaries
        - shared_runtime_layer
        - template_feature_module

  - wire_core_runtime:
      checklist:
        - query_provider
        - http_client
        - env_contract
        - auth_guard_shell

  - apply_strict_configs:
      checklist:
        - strict_typescript
        - path_aliases
        - tailwind_postcss_setup
        - base_next_config

  - final_sanity:
      checklist:
        - route_shell_loads
        - no_layer_violations_in_starter
        - clear_replacement_points_documented
        - starter_showcase_contains_reusable_ui_baseline

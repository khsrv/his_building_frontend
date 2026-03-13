---
description: Reuse starter UI components first and create new primitives only for validated gaps
---

id: starter_reuse_workflow
type: core
goal: Keep new project work fast and consistent by reusing existing starter components

trigger:
  - starter_reuse
  - component_reuse
  - universal_component_request

steps:
  - inventory_existing_components:
      checklist:
        - shared_ui_index_reviewed
        - primitives_and_layout_reviewed
        - starter_showcase_reviewed

  - map_requirement_to_existing:
      output:
        - requirement_to_component_mapping
        - extension_points
        - confirmed_gaps

  - implement_with_reuse_priority:
      order:
        - use_as_is
        - compose_or_wrap
        - extend_props
        - new_primitive_if_gap_confirmed

  - validate_consistency:
      checklist:
        - typography_spacing_radius_match_starter
        - compact_density_preserved
        - no_duplicate_ui_primitives

  - document_result:
      output:
        - reused_components_list
        - new_components_with_gap_reason

---
description: Adapt existing UI to mobile/tablet/desktop with mobile-first discipline
---

id: responsive_adaptation_workflow
type: ux
goal: Deliver responsive behavior without regressions in usability or accessibility

trigger:
  - responsive_task
  - adaptive_fix
  - mobile_layout_issue

steps:
  - map_viewport_issues:
      output:
        - mobile_issues
        - tablet_issues
        - desktop_issues

  - implement_mobile_first:
      constraints:
        - base_styles_for_mobile
        - progressive_enhancement_for_md_lg

  - handle_data_dense_ui:
      checklist:
        - table_mobile_fallback
        - filter_action_reachability
        - no_clipped_dialogs

  - verify:
      checklist:
        - no_horizontal_overflow
        - primary_cta_visible
        - keyboard_and_touch_usability

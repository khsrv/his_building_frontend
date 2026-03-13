---
description: Frontend workflow catalog for Next.js + TypeScript projects
---

# Frontend Workflow Catalog

Use exactly one primary workflow. Add one secondary workflow only if there is a hard dependency.

## Available Workflows
- `starter_reuse_workflow`:
  Reuse existing starter components first; add new primitives only for verified gaps.
- `project_bootstrap_workflow`:
  Initialize a brand-new frontend project with strict baseline architecture.
- `feature_delivery_workflow`:
  End-to-end feature delivery from requirement clarification to ready-to-merge.
- `bug_fix_workflow`:
  Minimal and safe bug fix with regression checks.
- `admin_module_workflow`:
  Delivery flow for dense admin screens (table/filter/form/actions/permissions).
- `responsive_adaptation_workflow`:
  Adapt existing UI for mobile/tablet/desktop with mobile-first rules.
- `data_contract_change_workflow`:
  API schema or payload changes with compatibility and migration checks.
- `pre_commit_quality_gate`:
  Final quality checklist before commit/PR.
- `refactor_safely_workflow`:
  Refactor without behavior changes.
- `performance_investigation_workflow`:
  Evidence-first performance diagnosis and fixes.

## Selection Guidelines
- Reuse starter/universal components request -> `starter_reuse_workflow`
- New project initialization -> `project_bootstrap_workflow`
- New feature/screen/flow -> `feature_delivery_workflow`
- Bug/regression/broken behavior -> `bug_fix_workflow`
- CRM-style table-heavy admin module -> `admin_module_workflow`
- Responsive/mobile adaptation task -> `responsive_adaptation_workflow`
- Backend contract or DTO/schema changes -> `data_contract_change_workflow`
- Explicit cleanup/refactor request -> `refactor_safely_workflow`
- Slowness/re-render/bundle complaints -> `performance_investigation_workflow`
- Pre-PR review request -> `pre_commit_quality_gate`

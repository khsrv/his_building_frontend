---
description: Selects the correct frontend workflow and keeps execution minimal.
---

# WORKFLOW_ROUTER.md
version: 1
name: "Frontend Workflow Router"
priority: highest

global:
  must:
    - "Follow frontend-core.md always."
    - "Select 1 primary workflow and at most 1 secondary."
    - "Prefer minimal change that solves the user request."
  forbid:
    - "Starting coding without selecting workflow intent."
    - "Selecting multiple workflows with no dependency."
    - "Adding heavy UI libraries by default without justification."

workflows:
  - id: "starter_reuse_workflow"
    goal: "Map requests to existing starter components and avoid rebuilding from zero."
  - id: "project_bootstrap_workflow"
    goal: "Initialize a new project with strict baseline architecture."
  - id: "feature_delivery_workflow"
    goal: "Deliver a new feature safely and consistently."
  - id: "bug_fix_workflow"
    goal: "Fix a bug with minimal blast radius."
  - id: "admin_module_workflow"
    goal: "Build table-heavy admin modules with filters and actions."
  - id: "responsive_adaptation_workflow"
    goal: "Adapt UI for mobile/tablet/desktop safely."
  - id: "data_contract_change_workflow"
    goal: "Apply backend/API contract changes safely."
  - id: "pre_commit_quality_gate"
    goal: "Run final quality checks before commit."
  - id: "refactor_safely_workflow"
    goal: "Refactor code without behavior drift."
  - id: "performance_investigation_workflow"
    goal: "Diagnose and fix performance issues with evidence."

router:
  output_format:
    - "1-line task restatement"
    - "Selected PRIMARY workflow"
    - "Selected SECONDARY workflow (if required)"
    - "Why selected (1-2 bullets)"
    - "Next steps"

  rules:
    - if_any:
        - contains: "reuse"
        - contains: "starter"
        - contains: "do not build from zero"
        - contains: "не с нуля"
        - contains: "готовые компоненты"
        - contains: "универсальный компонент"
      then:
        primary: "starter_reuse_workflow"
        secondary: null

    - if_any:
        - contains: "new project"
        - contains: "start project"
        - contains: "bootstrap"
        - contains: "инициализируй"
        - contains: "создай каркас"
      then:
        primary: "project_bootstrap_workflow"
        secondary: null

    - if_any:
        - contains: "before commit"
        - contains: "before pr"
        - contains: "перед коммитом"
        - contains: "перед pr"
        - contains: "review"
        - contains: "проверь"
      then:
        primary: "pre_commit_quality_gate"
        secondary: null

    - if_any:
        - contains: "bug"
        - contains: "fix"
        - contains: "сломалось"
        - contains: "не работает"
        - contains: "ошибка"
        - contains: "regression"
      then:
        primary: "bug_fix_workflow"
        secondary: null

    - if_any:
        - contains: "admin"
        - contains: "crm"
        - contains: "table"
        - contains: "filters"
        - contains: "кабинет"
        - contains: "админ"
      then:
        primary: "admin_module_workflow"
        secondary: null

    - if_any:
        - contains: "responsive"
        - contains: "adaptive"
        - contains: "mobile layout"
        - contains: "breakpoint"
        - contains: "адаптив"
        - contains: "мобильн"
      then:
        primary: "responsive_adaptation_workflow"
        secondary: null

    - if_any:
        - contains: "dto"
        - contains: "schema"
        - contains: "contract"
        - contains: "api change"
        - contains: "payload"
        - contains: "migration"
      then:
        primary: "data_contract_change_workflow"
        secondary: null

    - if_any:
        - contains: "performance"
        - contains: "slow"
        - contains: "lag"
        - contains: "web vitals"
        - contains: "тормозит"
      then:
        primary: "performance_investigation_workflow"
        secondary: null

    - if_any:
        - contains: "refactor"
        - contains: "cleanup"
        - contains: "рефактор"
      then:
        primary: "refactor_safely_workflow"
        secondary: null

    - default:
        primary: "feature_delivery_workflow"
        secondary: null

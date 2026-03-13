---
name: starter_component_reuse
description: Use this skill for any UI task to map requested behavior to existing starter components first, extend via composition, and create new primitives only for proven gaps.
---

# Starter Component Reuse

## Goal
Avoid rebuilding UI from zero when starter components already solve the task.

## Run This Skill When
- User asks for new UI/widgets/components/screens.
- Task touches tables, filters, forms, menus, layout shell, or common actions.
- User asks for "universal", "starter", "reuse", or "not from scratch".

## Reuse Checklist
1. Inspect existing components:
- `src/shared/ui/primitives`
- `src/shared/ui/layout`
- `src/shared/ui/index.ts`
- `src/modules/_template/presentation/components/starter-showcase.tsx`

2. Build mapping before coding:
- requirement -> existing component -> required props/composition

3. Choose implementation strategy:
- Use as-is.
- Extend props.
- Compose wrapper component.
- New primitive only if gap is real.

## Starter Mapping Guide
- actions/buttons -> `AppButton`
- text/select/multi-select -> `AppInput`, `AppSelect`, `AppSmartTextInput`
- date/range -> `AppDateRangePicker`
- data grids/admin lists -> `AppDataTable`
- row/global action menus -> `AppActionMenu`, `AppWidgetMenu`
- filter modal -> `AppWidgetFilterModal`, `AppUrlFilterBar`
- create/edit forms -> `AppEntityEditor`, `AppDrawerForm`, `AppFileUpload`
- shell/navigation -> `AppSidebar`, `AppTopBar`, `AppShell`
- states/feedback -> `AppStatePanel`, `AppStatusBadge`, `ConfirmDialog`

## Guardrails
- Do not duplicate primitives with similar behavior.
- Keep sizing/typography aligned with existing compact scale.
- If creating a new primitive, document why current starter components are insufficient.

## Output
- Short reuse map (what reused vs what added).
- List of components extended.
- Gap note for each new primitive (if any).

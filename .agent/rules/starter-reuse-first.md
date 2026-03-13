# Starter Reuse-First Rule

Core principle: "Велосипед не изобретай" (do not reinvent the wheel).

## Goal
Prevent duplicate UI primitives and keep all projects consistent with the starter kit.

## Mandatory Flow Before UI Implementation
1. Inspect existing building blocks in:
- `src/shared/ui/primitives`
- `src/shared/ui/layout`
- `src/modules/_template/presentation/components/starter-showcase.tsx`

2. Build a quick mapping:
- requested UI behavior -> existing component/API -> extension plan

3. Only create new component if mapping has a true gap.

## Reuse Priority Order
1. Use existing component as-is.
2. Extend through props/composition.
3. Extract reusable wrapper around existing primitive.
4. Create new primitive (last resort).

## Preferred External Building Blocks (for complex primitives)
- Menus/overlays/dialog/select internals: Radix UI primitives.
- Data table engine: TanStack Table.
- Date and range calendar engine: `react-day-picker` (or chosen UI library equivalent).
- Advanced select/multi/creatable: `react-select` (or chosen UI library equivalent).
- File drag-and-drop upload: `react-dropzone`.

Rule:
- For these categories, prefer battle-tested libraries under `App*` wrappers.
- Do not implement low-level behavior (focus trap, keyboard navigation, sorting engines, popover positioning) from scratch unless there is a documented hard constraint.

## Required Existing Components to Check First
- `AppButton`
- `AppInput` / `AppSelect` / `AppSmartTextInput`
- `AppDateRangePicker`
- `AppDataTable`
- `AppActionMenu`
- `AppWidgetMenu` / `AppWidgetFilterModal`
- `AppEntityEditor`
- `AppSidebar` / `AppTopBar` / `AppShell`
- `AppStatePanel` / `AppStatusBadge`

## Forbidden
- Rebuilding button/input/table/menu components from scratch when starter equivalents exist.
- Creating one-off variants that break typography/spacing/radius token system.
- Adding parallel components with overlapping responsibilities in feature folders.

## Quality Gate
- If new primitive is introduced, include a short "gap reason" note.
- Add at least one usage sample in the starter showcase or feature demo page.
- Confirm compact sizing parity with existing starter components.

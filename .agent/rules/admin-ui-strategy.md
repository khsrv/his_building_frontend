# Admin UI Strategy (MUI-First)

## 1. Base Policy
- Admin and CRM modules use **MUI-first** by default.
- Shared UI contract stays behind `App*` wrappers in `src/shared/ui`.
- Feature code imports `App*` components, not raw `@mui/*`.

## 2. Table and Date Defaults
- Data grid default: `MUI DataGrid` (Community).
- Date input default: `@mui/x-date-pickers` (`DatePicker` based flows).
- Export remains utility-driven (PDF/Excel), triggered from `AppDataTable`.

## 3. Design Consistency
- Keep POS.TJ token style across light/dark: compact density, same radius, same spacing scale.
- No style drift between sidebar, topbar, forms, and table controls.
- Reuse one size system for controls (`AppButton`, `AppInput`, `AppSelect`, table toolbar actions).

## 4. Non-Negotiables
- Do not mix MUI with Ant Design in one module.
- Do not rebuild complex primitives from scratch when `App*` wrapper already exists.
- Keep architecture boundaries unchanged regardless of visual implementation.

## 5. Escalation Path
- If DataGrid Community cannot satisfy a required feature, first evaluate wrapper-level workaround.
- Only then document a scoped exception (MUI X Pro/Premium or AG Grid) with explicit reason.

# Frontend/Backend Gap Audit

Date: 2026-03-19

## Implemented

- `clients`
  - `assignManager` aligned to `PATCH /api/v1/clients/{id}/manager`.
  - `addInteraction` payload aligned to `interaction_type` + `description`.
  - `create/update` payload aligned to `phone_additional` + `assigned_manager_id`.
  - pipeline board parsing aligned to `data.columns[]` with nested `stage` + `clients`.
  - dual parsing for snake_case + PascalCase responses enabled in repository mapping.
- `payments`
  - upcoming payments parsing supports both `remaining_amount` and `remaining`.
  - overdue parsing supports nested `schedule_item`.
  - response parsing hardened against mixed runtime formats.
- `finance`
  - dual parsing added for accounts, transactions, expense categories, reminders, currencies, exchange rates.
  - `mark-paid` mutation signature changed to `{ id, amount }` and payload now sends required `amount`.
  - transaction create payload now sends `transaction_date` as `YYYY-MM-DD`.
  - `property-cost` report wired to `GET /api/v1/reports/property-cost/{id}` with UI tab on finance reports page.
- `warehouse`
  - stock movement create payload aligned to `price_per_unit`.
  - list/detail mappings hardened for runtime domain responses (PascalCase).
  - supplier statement wired to `GET /api/v1/suppliers/{id}/statement`.
  - all supplier balances wired to `GET /api/v1/supplier-balances`.
- `advanced`
  - pricing rules list aligned to `GET /api/v1/pricing-rules/property/{property_id}`.
  - repository parsing hardened for pricing/brokers/invoices runtime formats.
  - unit price history wired to `GET /api/v1/units/{id}/price-history`.
- `contracts` + `settings/templates` + `settings/sms-templates`
  - template/log mappings hardened for domain-like runtime responses.
  - `sendSms`/`bulkSendSms` response envelope handling fixed.
  - `POST /api/v1/deals/{id}/generate-contract` wired in deal detail UI with template selection + preview.
- `land`, `masters`, `settings/company`, `settings/users`
  - dual parsing enabled in repositories.
  - `/api/v1/settings` now supports `map<string,string>` response format.
  - admin status reads switched from invalid `res.status` to `data.status`.
- `masters` UI validation
  - create master now requires `phone` and `specialization`.
  - complete work order now validates `actual_amount > 0`.
- `properties` + `buildings`
  - list/detail/units/chessboard parsing hardened for mixed response formats.
  - `createBlock` parsing fixed for runtime shape `data.block` (instead of direct block object).
  - `bulkCreateUnits` parsing fixed for runtime shape `data.created` + `data.items` (not only `count`).
  - floors parsing now safe if backend omits `units_count`.
- `deals`
  - list/detail/schedule/payments/client-search/unit-search/properties parsing moved to dual-format normalized parsing.
  - default-safe mapping added for missing numeric/string fields to avoid runtime crashes on partial payloads.
- `dashboard`
  - all dashboard queries now parse normalized envelopes (snake_case + PascalCase).
  - property analytics mapping now supports both nested and flat backend runtime shape.
  - export endpoint wired to `GET /api/v1/dashboard/export` (json export action in dashboard UI).
- `profile`
  - `/api/v1/users/me` and `/api/v1/auth/sessions` parsing normalized.
  - sessions now support `expires_at` fallback for “last activity” rendering.
- route-level TODO screens replaced with working flows
  - `deals/new` now uses real create-deal flow.
  - `cashier` now uses real create-deal flow (instead of mock wizard).
  - `buildings/new` now uses real create-property mutation.
  - `clients/new` now uses real create-client mutation.
  - analytics pages now render real dashboard/finance-driven data.
  - `settings/roles` now renders role distribution based on real users list.

## Partially Implemented

- some screens rely on backend joined/human-readable fields (`manager_name`, `property_name`, etc.) not always returned by backend.
  - safe fallbacks are now applied to avoid runtime crashes, but display can be less rich until backend enriches responses.

## Missing

- backend endpoints still without explicit UI flow in this frontend:
  - public tenant-facing endpoints under `/api/v1/public/*` (outside admin CRM UI scope)

## Broken by Contract Mismatch (Fixed in This Pass)

- `payments/upcoming`: `remaining` vs `remaining_amount`.
- `payments/overdue`: nested `schedule_item`.
- `clients`: manager endpoint path and request field names.
- `pipeline/board`: `columns` + nested `stage`.
- `finance`: mixed PascalCase responses in runtime payloads.
- `warehouse`: `price_per_unit` request field and movement response shape.
- `advanced`: pricing rules list route mismatch.
- `settings/company`: settings map response format.
- `settings/users`: invalid `res.status` assumption.
- `properties/create-block`: runtime returns `data.block` wrapper.
- `properties/units/bulk`: runtime returns `created` counter instead of `count`.
- `dashboard/property-analytics`: runtime flat shape differs from expected nested UI DTO shape.
- `profile/sessions`: runtime `expires_at` differs from expected `last_used_at`.

## POST/PATCH Endpoint Audit

### Fixed in This Pass

- `PATCH /api/v1/clients/{id}/manager`
- `POST /api/v1/clients/{id}/interactions`
- `POST /api/v1/clients`
- `PATCH /api/v1/clients/{id}`
- `POST /api/v1/stock-movements`
- `POST /api/v1/payable-reminders/{id}/mark-paid`
- `POST /api/v1/transactions`
- `POST /api/v1/properties/{id}/blocks` (response parsing fix for `data.block`)
- `POST /api/v1/units/bulk` (response parsing fix for `data.created`)

### Verified and Working with Updated Parsing

- `POST/PATCH` in `finance`: accounts, categories, currencies, exchange rates, reminders cancel/create.
- `POST/PATCH` in `masters`: create/update master, create/start/complete/accept work orders.
- `POST/PATCH` in `land`: create/update plot, create owner.
- `POST/PATCH` in `contracts/sms`: templates create/update, sms send/bulk-send.
- `POST` in `advanced`: pricing rules create, brokers create, broker-deals assign, invoices pay.

### UI Not Fully Implemented (Create Flow Exists as Placeholder/TODO)

- none identified in audited modules for this pass

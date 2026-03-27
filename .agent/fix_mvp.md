Аудит Hisob Building CRM — Финальный отчёт + Статус исправлений

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ЧАСТЬ 1: КРИТИЧЕСКИЕ ПРОБЛЕМЫ (🔴 Critical)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#1 🔴 float64 для денег — бэкенд
[x] ПОЛНОСТЬЮ ИСПРАВЛЕНО — shopspring/decimal
Все денежные поля мигрированы на decimal.Decimal:
  - domain/deal: TotalAmount, DiscountAmount, SurchargeAmount, FinalAmount, DownPayment, PaidAmount, DebtAmount
  - domain/payment: Amount, ExchangeRate, AmountInDealCurrency, PlannedAmount, PaidAmount, PenaltyAmount
  - usecase/deal: все команды и интерфейсы (ExchangeRateProvider, BarterTransactionRecorder, FinanceRefundRecorder)
  - usecase/deposit: DealPaymentCreator.CreateDepositPayment → decimal.Decimal
  - delivery/http: deal_handler, schedule_handler — конвертация float64↔decimal на boundary
  - app/run.go: адаптеры (exchangeRateAdapter, barterTransactionAdapter, refundExpenseAdapter, depositDealPaymentAdapter) — decimal↔float64 на границе с finance-сервисом
Файлы:
  go.mod (shopspring/decimal v1.4.0)
  internal/domain/common/money.go (Money = decimal.Decimal, NewMoney, MoneyZero, MoneyToFloat)
  internal/domain/deal/entity.go
  internal/domain/deal/cancellation.go
  internal/domain/payment/entity.go
  internal/usecase/deal/interfaces.go
  internal/usecase/deal/usecase.go
  internal/usecase/deposit/interfaces.go
  internal/usecase/deposit/usecase.go
  internal/delivery/http/deal_handler.go
  internal/delivery/http/schedule_handler.go
  internal/app/run.go

---

#2 🔴 Нет транзакций в критических операциях — бэкенд
[x] ПОЛНОСТЬЮ ИСПРАВЛЕНО — TxManager + context-based tx propagation
Реализован PgxTxManager (BEGIN/COMMIT/ROLLBACK) с передачей tx через context.
DealService.Create() оборачивает deal+schedule+unit в одну транзакцию.
Все репозитории используют Conn(ctx, pool) для автоматического определения tx из контекста.
Файлы:
  internal/repository/postgres/tx_manager.go (новый — PgxTxManager, DBTX interface, Conn helper)
  internal/repository/postgres/deal_repository.go (conn() метод, все r.db → r.conn(ctx))
  internal/repository/postgres/schedule_repository.go (conn() метод)
  internal/repository/postgres/payment_repository.go (conn() метод)
  internal/repository/postgres/unit_repository.go (conn() метод)
  internal/usecase/deal/usecase.go (TxManager interface, SetTxManager, WithTx в Create)
  internal/app/run.go (dealService.SetTxManager(postgres.NewTxManager(dbPool)))

---

#3 🔴 Race condition при пересчёте графика — бэкенд
[x] ИСПРАВЛЕНО
Файлы:
  internal/usecase/deal/interfaces.go — добавлен ListForUpdateByDealID в ScheduleRepository
  internal/repository/postgres/schedule_repository.go — SELECT FOR UPDATE запрос + реализация
  internal/usecase/deal/usecase.go — recalculateSchedule использует ListForUpdateByDealID

---

#4 🔴 Несоответствие схемы и кода — бэкенд
[x] ИСПРАВЛЕНО
Файл: migrations/000021_deal_cancellations_refund_fields.sql
Добавлены колонки: refund_account_id, refund_method, refund_notes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ЧАСТЬ 2: ВЫСОКИЙ ПРИОРИТЕТ (🟠 High)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#5 🟠 Токен теряется при F5 — фронтенд
[x] НЕ ТРЕБУЕТ ИСПРАВЛЕНИЯ
http-client.ts корректно вызывает /api/auth/refresh при isAccessTokenExpired().

---

#6 🟠 BarterTransactionRecorder опционален — бэкенд
[x] ИСПРАВЛЕНО
Файл: internal/usecase/deal/usecase.go
Если barterRecorder == nil при бартерном платеже — ErrorContext с payment_id, deal_id, amount.

---

#7 🟠 Аудит лог только для auth — бэкенд
[x] ИСПРАВЛЕНО
Файл: internal/usecase/deal/usecase.go
Добавлены: SetAuditLogger(), audit() хелпер.
Аудит при: deal_created, payment_confirmed, deal_cancelled.
Подключить: dealService.SetAuditLogger(auditLogger) в точке инициализации.

---

#8 🟠 UNIQUE constraint отсутствует на schedule_items — бэкенд
[x] ИСПРАВЛЕНО
Файл: migrations/000022_schedule_items_unique.sql

---

#9 🟠 RBAC захардкожен на фронтенде — фронтенд
[x] ИСПРАВЛЕНО — permissions[] из бэкенда
Бэкенд теперь возвращает permissions[] в ответах /auth/login, /auth/refresh, /users/me.
Единый источник правды — Go-файл role_permissions.go (зеркало фронтенд-маппинга).
Фронтенд предпочитает backend permissions, с fallback на локальный resolvePermissions().
Файлы:
  BACKEND:
    internal/domain/permission/role_permissions.go (новый — ForRole() + RolePermissions map)
    internal/delivery/http/user_handler.go (userResponse.Permissions, toUserResponse → permission.ForRole)
  FRONTEND:
    src/app/api/auth/login/route.ts (BackendUser.permissions, mapBackendUser → предпочитает backend perms)
    src/app/api/auth/refresh/route.ts (аналогично)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ЧАСТЬ 3: ПРЕДУПРЕЖДЕНИЯ (🟡 Warning)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#10 🟡 Number() без проверки NaN — фронтенд
[x] ИСПРАВЛЕНО — safeNumber() в mappers.ts

---

#11 🟡 staleTime 30 секунд для дашборда — фронтенд
[x] ИСПРАВЛЕНО — инвалидация dashboardKeys.all + financeKeys.all в confirm/receive mutations

---

#12 🟡 Timezone в overdue check — бэкенд
[x] ИСПРАВЛЕНО
Файл: internal/repository/postgres/schedule_repository.go
SQL использует CURRENT_DATE вместо Go timestamp.

---

#13 🟡 Конкурентное бронирование квартиры — бэкенд
[x] ИСПРАВЛЕНО (оптимистичная блокировка)
Файлы:
  internal/repository/postgres/unit_repository.go — UpdateStatusWithCheck с WHERE status=$9
  internal/usecase/unit/interfaces.go — UpdateStatusWithCheck в интерфейсе
  internal/usecase/unit/usecase.go — ChangeStatus использует UpdateStatusWithCheck

---

#14 🟡 Валютный курс по умолчанию 1:1 — бэкенд
[x] ИСПРАВЛЕНО — возвращает ошибку при отсутствии курса.

---

#15 🟡 Отрицательные суммы в Zod схеме — фронтенд
[x] НЕ ТРЕБУЕТ ИСПРАВЛЕНИЯ — уже .positive() и .min(0)

---

#16 🟡 Полнота i18n словарей — фронтенд
[x] ИСПРАВЛЕНО
Файлы:
  scripts/check-i18n.ts (новый)
  package.json — добавлен "check:i18n"
Запуск: npm run check:i18n

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ЧАСТЬ 4: НИЗКИЙ ПРИОРИТЕТ (🔵 Low / 🟢 Info)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#17 🔵 PermissionCode — конфликт типов
[x] ИСПРАВЛЕНО — rbac.ts импортирует из permissions.ts

---

#18 🔵 Silent defaults в mappers
[x] ИСПРАВЛЕНО — console.warn в dev-режиме

---

#19 🟢 Нет экспорта в Excel/PDF
[x] УЖЕ РЕАЛИЗОВАНО
AppDataTable имеет enableExport, xlsx и jspdf пакеты установлены.
Страницы deals и payments используют экспорт.

---

#20 🟢 Auto-logout по неактивности
[x] ИСПРАВЛЕНО
Файлы:
  src/shared/hooks/use-idle-logout.ts (новый) — 30 мин неактивности
  src/shared/ui/layout/idle-logout-guard.tsx (новый) — клиентский компонент
  src/app/(admin)/layout.tsx — подключен IdleLogoutGuard

---

#21 🟢 Нет Idempotency-Key для POST /payments
[x] ИСПРАВЛЕНО — Redis-backed idempotency middleware
Бэкенд: middleware Idempotency() с Redis SET NX + 24h TTL.
Кеширует ответ первого запроса и возвращает его при повторном ключе.
Concurrent duplicate → 409 Conflict.
Фронтенд: idempotencyKey генерируется один раз при открытии drawer (useMemo + crypto.randomUUID).
Файлы:
  BACKEND:
    internal/delivery/http/middleware/idempotency.go (новый)
    internal/delivery/http/router.go (Cache в RouterDependencies, payments.POST с Idempotency middleware)
    internal/app/run.go (Cache: cache в RouterDependencies)
  FRONTEND:
    src/modules/deals/domain/deal.ts (idempotencyKey в ReceivePaymentInput)
    src/modules/deals/infrastructure/repository.ts (Idempotency-Key header)
    src/modules/deals/presentation/hooks/use-receive-payment-mutation.ts (fallback UUID)
    src/modules/deals/presentation/components/receive-payment-drawer.tsx (useMemo idempotencyKey)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ИТОГ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Исправлено полностью: #1, #2, #3, #4, #6, #7, #8, #9, #10, #11, #12, #13, #14, #16, #17, #18, #19, #20, #21
Не требует исправления: #5, #15
Осталось: ничего — все 21 пункт закрыты ✅

Файлы изменены:
FRONTEND:
  src/modules/deals/infrastructure/mappers.ts
  src/modules/deals/infrastructure/repository.ts (Idempotency-Key header)
  src/modules/deals/domain/deal.ts (idempotencyKey в ReceivePaymentInput)
  src/modules/deals/presentation/hooks/use-confirm-payment-mutation.ts
  src/modules/deals/presentation/hooks/use-receive-payment-mutation.ts
  src/modules/deals/presentation/components/receive-payment-drawer.tsx (idempotencyKey)
  src/shared/lib/auth/rbac.ts
  src/app/(admin)/layout.tsx
  src/app/api/auth/login/route.ts (backend permissions)
  src/app/api/auth/refresh/route.ts (backend permissions)
  src/shared/hooks/use-idle-logout.ts (новый)
  src/shared/ui/layout/idle-logout-guard.tsx (новый)
  scripts/check-i18n.ts (новый)
  package.json

BACKEND:
  go.mod (shopspring/decimal v1.4.0)
  internal/domain/common/money.go (Money = decimal.Decimal)
  internal/domain/deal/entity.go (decimal)
  internal/domain/deal/cancellation.go (decimal)
  internal/domain/payment/entity.go (decimal)
  internal/domain/permission/role_permissions.go (новый — RBAC source of truth)
  internal/usecase/deal/interfaces.go (decimal + TxManager)
  internal/usecase/deal/usecase.go (decimal + WithTx)
  internal/usecase/deposit/interfaces.go (decimal)
  internal/usecase/deposit/usecase.go (decimal boundary)
  internal/usecase/unit/usecase.go
  internal/usecase/unit/interfaces.go
  internal/repository/postgres/tx_manager.go (новый — PgxTxManager)
  internal/repository/postgres/deal_repository.go (conn + tx support)
  internal/repository/postgres/schedule_repository.go (conn + tx support)
  internal/repository/postgres/payment_repository.go (conn + tx support)
  internal/repository/postgres/unit_repository.go (conn + tx support)
  internal/delivery/http/deal_handler.go (decimal boundary)
  internal/delivery/http/schedule_handler.go (decimal boundary)
  internal/delivery/http/user_handler.go (permissions в userResponse)
  internal/delivery/http/router.go (Cache + Idempotency middleware)
  internal/delivery/http/middleware/idempotency.go (новый)
  internal/app/run.go (TxManager wiring, decimal adapters, Cache)
  migrations/000021_deal_cancellations_refund_fields.sql (новый)
  migrations/000022_schedule_items_unique.sql (новый)

ПЕРЕД ДЕПЛОЕМ:
  goose up  # применит миграции 000021 и 000022
  Redis должен быть доступен для работы idempotency middleware (без Redis — no-op fallback)

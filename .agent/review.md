🔍 Hisob Building CRM/ERP — Комплексный промпт для аудита кода
Цель: Провести полный технический аудит фронтенда и бэкенда CRM/ERP-системы для застройщиков, проверить надёжность финансовых расчётов, безопасность, масштабируемость и устойчивость к ошибкам — на уровне проверенных enterprise-систем (1С, SAP, Salesforce для девелоперов).

Контекст для агента
Ты проводишь глубокий технический аудит проекта Hisob Building — CRM/ERP-системы для девелоперов недвижимости. Проект написан на Next.js 16 + TypeScript strict + MUI 7 + TanStack Query 5. Архитектура — модульная clean architecture с 17 feature-модулями. Система поддерживает multi-tenant (суперадмин + арендаторы/компании).

Твоя задача — найти все подводные камни, ошибки, слабые места и потенциальные проблемы. Для каждой найденной проблемы: опиши её, покажи где в коде она находится, объясни почему это опасно, и дай конкретное решение.

ЧАСТЬ 1: ФРОНТЕНД-АУДИТ
1.1 🔐 Аутентификация и сессии
Файлы для проверки:

src/shared/lib/http/http-client.ts
 — HTTP-клиент с token refresh
src/shared/lib/http/token-storage.ts
 — хранение токенов
src/modules/auth/presentation/components/auth-guard.tsx
 — серверный guard
src/modules/auth/infrastructure/auth-repository.ts
src/modules/auth/infrastructure/session-cookie.ts
src/modules/auth/infrastructure/password-auth-client.ts
src/app/api/ — BFF route handlers
Что проверить:

Токен в памяти после перезагрузки страницы — access token хранится в JS-переменной (let _accessToken). При F5 / навигации пользователь будет разлогинен. Есть ли механизм silent refresh при загрузке? Если нет — это критичный UX-баг.
Race condition при refresh — в http-client.ts есть _refreshPromise lock, но проверь: что произойдёт, если 5 запросов одновременно получат 401? Все 5 должны ждать один refresh, а не каждый делать свой.
Refresh token rotation — поддерживает ли бэкенд ротацию refresh-токенов? Если нет — утечка одного cookie = полный доступ навсегда.
CSRF-защита — cookie SameSite=Strict? HttpOnly? Secure? Проверь BFF route handler /api/auth/refresh.
Logout everywhere — есть ли серверный endpoint для инвалидации всех сессий пользователя? Это критично при смене пароля или подозрении на взлом.
Таймаут неактивности — есть ли auto-logout через N минут бездействия? Для финансовой системы это обязательно.
AuthGuard на серверных страницах — проверь что ВСЕ (admin)/ маршруты обёрнуты в AuthGuard. Пропуск одной страницы = дыра в безопасности.
1.2 🛡️ RBAC и права доступа
Файлы для проверки:

src/shared/types/permissions.ts — роли и маппинг прав
src/shared/lib/auth/rbac.ts — утилиты проверки
src/shared/ui/layout/app-shell.tsx — навигация по правам
Что проверить:

Клиентская vs серверная проверка — ROLE_PERMISSIONS маппинг захардкожен на фронте. Если бэкенд имеет другой маппинг = рассинхронизация. Права ДОЛЖНЫ приходить с бэкенда, а не вычисляться на фронте.
Горизонтальная авторизация — менеджер А может видеть клиентов/сделки менеджера Б? Фронтенд не фильтрует по managerId. Это серверная ответственность — проверь что бэкенд это делает.
Мутация без проверки прав — в mutation hooks (напр. use-activate-deal-mutation.ts) есть ли проверка прав перед вызовом? Или кнопка просто не показывается, но API-вызов можно сделать через DevTools?
Роль broker — имеет deals.create, но не deals.update. Может создать сделку, но не может её редактировать. Логично ли? Проверь все edge cases.
super_admin vs company_admin — единственная разница — tenants.manage. Проверь что бэкенд не даёт company_admin доступ к tenant endpoints.
1.3 💰 Финансовые расчёты (КРИТИЧНО)
Файлы для проверки:

src/modules/deals/domain/deal.ts — типы сделок
src/modules/deals/infrastructure/mappers.ts — маппинг DTO → Domain
src/modules/deals/infrastructure/repository.ts — API-вызовы
src/modules/finance/domain/finance.ts — финансовые типы
src/shared/lib/format/amount-formatter.ts — форматирование сумм
Все файлы с amount, price, payment, balance в названии
Что проверить:

CAUTION

Это самая критичная секция. Ошибки здесь = реальные финансовые потери.

Floating-point арифметика — суммы хранятся как number (JS float64). 0.1 + 0.2 !== 0.3 в JS. Для финансовой системы ВСЕ суммы должны быть в копейках/тийинах (integer) или использовать библиотеку типа decimal.js. Проверь:

totalAmount, finalAmount, paidAmount, debtAmount — все number
discountAmount, surchargeAmount, penaltyAmount — все number
Как происходит расчёт: finalAmount = totalAmount - discountAmount + surchargeAmount? Фронт считает или бэкенд?
Есть ли расхождения при сложении всех plannedAmount в schedule vs finalAmount?
Мультивалютность — типы содержат currency: string, есть ExchangeRate. Проверь:

Сделка в UZS, платёж в USD — как конвертируется? Какой курс используется: на дату сделки или платежа?
Пересчёт остатка при изменении курса — происходит ли?
Курсовые разницы учитываются в отчётах?
Рассинхронизация paidAmount и debtAmount — эти поля в Deal приходят с бэкенда. Проверь:

При подтверждении платежа — paidAmount обновляется атомарно (в одной транзакции)?
Что если платёж подтверждён, но запрос на обновление paidAmount упал? Будет double-credit?
На бэкенде debtAmount computed или stored? Если stored — может рассинхронизироваться.
Переплата — что если paidAmount > finalAmount? UI показывает это? Бэкенд блокирует?

Отмена сделки с возвратом — DealCancellation имеет refundAmount и penaltyAmount. Проверь:

refundAmount = paidAmount - penaltyAmount? Или может быть > paidAmount (баг)?
Возврат создаёт обратную транзакцию в finance ledger?
Юнит возвращается в статус available после отмены?
Рассрочка (installment) — график платежей. Проверь:

Сумма всех plannedAmount в schedule === finalAmount - downPayment?
При частичной оплате remaining пересчитывается корректно?
Пени (penaltyAmount) — кто и когда их начисляет? Cron job? При каждом запросе?
Бартер — paymentMethod: "barter". Проверь:

BarterSellInput / BarterSellResult — при продаже бартерного актива: profitLoss = salePrice - bookValue. Это на фронте считается или на бэке?
Бартерный счёт (barterAccountId) — баланс обновляется корректно?
1.4 📊 Отчёты и аналитика
Файлы для проверки:

src/modules/finance/domain/finance.ts — IncomeExpenseReport, CashFlowReport, ReceivablesReport
src/modules/dashboard/ — главный дашборд
src/app/(admin)/analytics/ — аналитика
Что проверить:

Данные дашборда в реальном времени — кэшируются ли через TanStack Query? С каким staleTime? Если 5 мин — бухгалтер видит устаревшие данные.
Фильтры по датам — timezone-aware? Сервер в UTC, клиент в +05:00. При фильтре "сегодня" — чей "сегодня"?
Пагинация в отчётах — ReceivablesReport содержит items: readonly {...}[]. Если 10,000 клиентов с долгами — всё грузится одним запросом?
Экспорт — есть ли экспорт в Excel/PDF? Для бухгалтерии это must-have.
1.5 🏗️ Шахматка и объекты
Файлы для проверки:

src/modules/buildings/ и src/modules/properties/
src/shared/ui/ — AppColorGrid
src/app/(admin)/buildings/
Что проверить:

Concurrency (гонка состояний) — два менеджера одновременно бронируют одну квартиру. Кто "выигрывает"? Есть ли optimistic locking (ETag / version field) на бэкенде?
Статусная машина юнита — available → booked → sold и обратные переходы. Валидируются ли допустимые переходы на бэке? Или можно из sold перевести в available через API?
Массовые операции — копирование этажей, добавление блоков. При ошибке на 15-м из 20 юнитов — что происходит? Rollback или partial success?
Booking expiry — AppCountdownBadge для истечения брони. Таймер на фронте. А на бэке?Есть ли cron/scheduler который автоматически снимает бронь по истечении?
1.6 🔄 Состояние и кэш (TanStack Query)
Файлы для проверки:

Все query-keys.ts в модулях
Все use-*-mutation.ts хуки
src/shared/lib/query/query-client.ts
Что проверить:

Invalidation после мутаций — после confirmPayment инвалидируются ли: deal detail, deal schedule, deal payments, payments list, finance dashboard? Неполная инвалидация = stale UI.
Optimistic updates — используются ли? Для drag-and-drop в pipeline/kanban обязательны, иначе UX дёргается.
Error rollback — если optimistic update применён, но запрос упал — происходит ли откат?
Query key collision — между модулями нет общих ключей? ["deals"] в deals и ["deals"] в pipeline — конфликт.
Global error handler — есть ли на уровне QueryClient default onError? Для 401 — redirect, для 500 — toast.
1.7 📋 Формы и валидация
Файлы для проверки:

src/modules/deals/domain/deal.schema.ts
Все *-drawer.tsx и *-dialog.tsx компоненты
Wizard: src/app/(admin)/deals/new/page.tsx
Что проверить:

Zod-схемы — есть ли для всех форм? Или некоторые формы без валидации?
Server-side validation errors — маппятся ли обратно на поля формы? Или показывается generic toast?
Отрицательные суммы — можно ли ввести отрицательный totalAmount или discountAmount? Zod-схема должна проверять z.number().nonnegative().
Wizard state preservation — при навигации "Назад" в wizard данные предыдущих шагов сохраняются? Или теряются?
Double-submit prevention — кнопка "Создать сделку" блокируется при isPending? Или можно кликнуть 5 раз = 5 сделок?
1.8 🌐 Интернационализация
Файлы для проверки:

src/shared/i18n/ — все словари (en, ru, tg, uz)
Что проверить:

Полнота словарей — все 4 языка имеют одинаковые ключи? Или TG/UZ неполные (fallback на RU)?
Форматирование сумм — formatAmount() использует Intl.NumberFormat. Для UZS символ правильный? Для разделителей тысяч в TG/UZ правильная локаль?
Pluralization — "1 квартира", "2 квартиры", "5 квартир" — работает для всех языков?
RTL — не нужен сейчас, но подготовлена ли архитектура если добавят арабский?
ЧАСТЬ 2: БЭКЕНД-АУДИТ
2.1 💾 База данных и транзакции (КРИТИЧЕСКИЕ НАХОДКИ)
Файлы для проверки:

internal/usecase/deal/usecase.go — оркестрация логики
internal/domain/deal/entity.go и internal/domain/payment/entity.go — доменные модели
internal/repository/postgres/pool.go — работа с БД
migrations/000002_buildcrm_core.sql — схема БД
Что проверить:

Отсутствие паттерна Unit of Work (Транзакций) — В usecase.go методы, такие как Create (создание сделки -> генерация графика -> бронь юнита) или ConfirmPayment (подтверждение -> пересчёт графика -> бартер) делают отдельные вызовы к БД. Если генерация графика упадёт, сама сделка всё равно создастся. Остутствие единой транзакции (BEGIN...COMMIT) — это КРИТИЧНЫЙ баг для ERP.
Типы данных для денег (float64) — В entity.go суммы сделок и платежей (например, TotalAmount, PaidAmount) представлены как float64. Несмотря на DECIMAL(18,2) в базе, float64 в Go неизбежно вызовет проблемы с округлением (precision loss). Необходимо мигрировать модели на int64 (копейки) или shopspring/decimal.
Race condition при пересчёте графика — Метод recalculateSchedule обнуляет оплаченные суммы в графике и перераспределяет их заново, читая базу без SELECT FOR UPDATE. Конкурентные подтверждения платежей приведут к гонке данных.
Атомарность финансовых операций — В идеале приём платежа должен атомарно обновлять сделку, график и создавать финансовую транзакцию.
Deadlocks — при одновременном приёме платежей по одной сделке. Порядок блокировок таблиц одинаков?
Soft delete vs hard delete — сделки, платежи, клиенты — используется deleted_at или DELETE FROM? Для финсистемы удаление запрещено — только soft delete + сторно.
Audit log — все финансовые операции логируются с who, what, when, old_value, new_value? Без этого — не пройти аудит/ревизию.
Database migrations — есть ли версионирование схемы? Откат миграций работает?
Индексы — для таблиц с > 100k записей (платежи, транзакции, schedule_items) есть индексы на часто фильтруемые поля? deal_id, status, due_date, created_at.
2.2 🔒 API-безопасность
Что проверить:

Tenant isolation — КАЖДЫЙ запрос фильтрует по tenant_id. Если нет — арендатор А видит данные арендатора Б. Это P0-уязвимость.
Rate limiting — есть ли? На login, на API в целом. Без этого — brute-force, DDoS.
Input sanitization — все входные данные валидируются (Zod на бэке тоже). SQL injection, XSS в notes, description, cancellationReason.
Идемпотентность — POST /payments идемпотентен? Если нет — повторный запрос создаст дубликат. Используется ли Idempotency-Key header?
File upload — если есть загрузка документов: проверка типа файла, размера, вирусы?
2.3 📐 Бизнес-логика на бэкенде
Что проверить:

Статусная машина (state machine) для сделок:
draft → active → completed и draft/active → cancelled
Нельзя: completed → active, cancelled → active (если нет явного reopen)
Все переходы валидируются сервером, не только UI
Статусная машина для платежей:
pending → confirmed / rejected
confirmed — необратим (или только через сторно)
Статусная машина для юнитов:
available → booked → sold
booked → available (при истечении/отмене брони)
sold → available (только при отмене сделки)
Расчёт графика рассрочки:
Аннуитет или дифференцированный?
Округление — по какому правилу? Последний платёж компенсирует ошибку округления?
Пени за просрочку:
Начисляются автоматически (scheduler)?
Процент/сумма за день? Настраивается в settings?
Максимальный предел пени?
2.4 🏢 Multi-tenant
Что проверить:

Data isolation strategy — shared database с tenant_id column? Или schema-per-tenant? Или DB-per-tenant?
Middleware enforcement — каждый запрос автоматически добавляет WHERE tenant_id = ?? Или это вручную в каждом запросе (опасно — можно забыть)?
Cross-tenant operations — суперадмин может видеть данные всех tenants? Как это реализовано безопасно?
Tenant provisioning — при создании нового tenant: создаются ли default данные (roles, settings, pipeline stages)?
2.5 📬 Уведомления и SMS
Что проверить:

SMS gateway — какой провайдер? Есть ли fallback при недоступности?
Throttling — ограничение на количество SMS в день/час? Без этого — случайно отправишь 10,000 SMS.
Template injection — SMS-шаблоны содержат {{client_name}}, {{amount}} и т.д. Экранируются ли спецсимволы?
Delivery tracking — статус доставки SMS сохраняется?
ЧАСТЬ 3: ИНФРАСТРУКТУРА
3.1 Развёртывание и DevOps
Docker — Dockerfile есть. Multi-stage build? Image size оптимизирован?
Env variables — .env.local в .gitignore? Нет ли секретов в git history?
Health checks — есть ли /api/health endpoint?
Graceful shutdown — при деплое текущие запросы завершаются корректно?
Backup strategy — автоматический бэкап БД? Восстановление протестировано?
3.2 Мониторинг
Error tracking — Sentry/подобное подключено?
APM — время ответа API отслеживается?
Alerting — уведомления при: 500-ках, высоком response time, падении сервиса?
ЧАСТЬ 4: ЧЕКЛИСТ ФИНАЛЬНОГО ОТЧЁТА
Для каждого найденного issue создай запись в формате:

#	Серьёзность	Модуль	Файл(ы)	Описание проблемы	Риск	Решение
1	🔴 Critical	deals	repository.ts:128	Сумма как float	Финансовые потери	Перейти на integer (копейки)
2	🟡 Warning	auth	token-storage.ts	Токен теряется при F5	UX-деградация	Добавить silent refresh
3	🟢 Info	i18n	tg.ts	Неполный словарь	UI fallback	Дополнить переводы
Уровни серьёзности:

🔴 Critical — финансовые потери, утечка данных, потеря данных
🟠 High — некорректная бизнес-логика, security holes
🟡 Warning — UX-проблемы, performance, потенциальные баги
🔵 Low — code quality, best practices
🟢 Info — рекомендации, nice-to-have
Дополнительные инструкции
Проверяй оба слоя — для каждой функции проверяй и фронт, и бэк. Фронт может быть идеальным, но бэк может не валидировать.
Ищи edge cases — нулевые суммы, максимальные значения, пустые строки, Unicode в именах.
Тестируй сценарии — не просто читай код, а мысленно прогоняй: "Что если менеджер создаёт сделку на 0 сомони?", "Что если два кассира одновременно подтверждают один платёж?".
Приоритизируй — сначала Critical и High, потом остальное.
Конкретные решения — не "нужно улучшить", а "в файле X, строка Y заменить Z на W".
# Hisob Building — Frontend Admin Panel: План разработки

> **Для фронтенд-агента/разработчика.**
> Этот документ описывает пошаговый план создания админ-панели для BuildCRM — SaaS-платформы управления строительными компаниями.
> Бэкенд полностью готов и задокументирован в OpenAPI: `docs/api/openapi.yaml`
> **Стек фронтенда уже выбран и настроен** — используй то что есть в проекте. Этот план описывает только ЧТО делать, а не на ЧЁМ.

---

## Обзор проекта

### Что это
Multi-tenant SaaS для застройщиков. Каждая компания-застройщик (tenant) получает изолированную среду для:
- Управления ЖК, блоками, этажами, квартирами (шахматка)
- CRM: клиенты, воронка продаж, канбан-доска
- Сделки: рассрочка, ипотека, полная оплата
- Платежи: приём, подтверждение, графики, просрочки
- Финансы: счета, валюты, журнал операций, отчёты
- Склад: поставщики, материалы, движение, оплаты
- Мастера: наряды, подрядчики
- Документы: шаблоны договоров
- SMS: шаблоны, отправка, логи
- Земля: участки, владельцы
- Напоминалки: исходящие платежи поставщикам/подрядчикам

### Авторизация (как работает бэкенд)
- Login → `POST /api/v1/auth/login` → получаем `access_token` + `refresh_token`
- `access_token` — JWT, время жизни 15 минут
- `refresh_token` — время жизни 7 дней
- При 401 → `POST /api/v1/auth/refresh` с refresh_token → новая пара токенов
- Роль и tenant_id берутся из `GET /api/v1/users/me` после логина
- Все защищённые запросы: заголовок `Authorization: Bearer <access_token>`
- Sidebar и навигация фильтруются по роли текущего пользователя

### Формат ответов бэкенда
Все ответы обёрнуты в envelope:
```json
// Успех:
{ "data": { ... } }

// Успех с пагинацией:
{ "data": { "items": [...], "pagination": { "page": 1, "limit": 20, "total": 150 } } }

// Ошибка:
{ "code": "NOT_FOUND", "message": "user not found", "details": {} }
```

### Роли и доступ к страницам

| Страница | super_admin | company_admin | sales_head | manager | accountant | cashier | foreman | warehouse_manager | broker |
|----------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Тенанты | ✅ | — | — | — | — | — | — | — | — |
| Пользователи | ✅ | ✅ | — | — | — | — | — | — | — |
| Объекты (read) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Объекты (write) | ✅ | ✅ | — | — | — | — | — | — | — |
| Клиенты/CRM | ✅ | ✅ | ✅ | ✅ | — | — | — | — | ✅ |
| Сделки | ✅ | ✅ | ✅ | ✅ | — | — | — | — | ✅ |
| Платежи | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | — |
| Финансы | ✅ | ✅ | — | — | ✅ | ✅ | — | — | — |
| Склад | ✅ | ✅ | — | — | — | — | ✅ | ✅ | — |
| Мастера | ✅ | ✅ | — | — | — | — | ✅ | ✅ | — |
| Земля | ✅ | ✅ | — | — | — | — | — | — | — |
| Настройки | ✅ | ✅ | — | — | — | — | — | — | — |

### Рекомендации по безопасности
- **Никогда не хранить access_token в localStorage** — только в памяти (state/store). Refresh token можно в httpOnly cookie или localStorage
- **Все API запросы через единый клиент** с interceptor'ом для автоматического refresh
- **Роли проверять и на фронте** (скрывать UI) и на бэкенде (бэкенд всё равно откажет, но UX лучше)
- **Не показывать внутренние ошибки** пользователю — маппить `code` из ответа в человекочитаемые сообщения

### Рекомендации по оптимизации
- **Debounce поиска** — 300ms задержка перед отправкой запроса
- **Кэширование списков** — при переходе назад не перезапрашивать если данные свежие
- **Пагинация** — бэкенд возвращает `total`, используйте серверную пагинацию
- **Lazy loading** — тяжёлые страницы (шахматка, отчёты, графики) грузить по demand
- **Виртуализация** — для списков > 100 элементов (таблицы)

---

## Фазы разработки

---

## Фаза 1: Авторизация и каркас

> **Цель:** работающий login, layout с sidebar, защищённые роуты, профиль пользователя.
> **Результат:** можно залогиниться, видеть sidebar по своей роли, выйти.

### 1.1 API клиент
- [x] Настроить HTTP клиент с baseURL бэкенда (`http://localhost:8080`)
- [x] Добавить interceptor: автоматически прикрепляет `Authorization: Bearer` к запросам
- [x] Добавить interceptor: при 401 → автоматически refresh → retry оригинального запроса
- [x] Обёртки типов для ответов: `ApiResponse<T>`, `PaginatedResponse<T>`, `ApiError`
- [x] `apiClient.get/post/patch/delete()` — единый клиент для модулей
- [x] `backendClient` — server-side BFF клиент
- [x] `tokenStorage` — access token в памяти, refresh token в localStorage

### 1.2 Авторизация
- [x] Страница Login — email + password
- [x] Вызов `POST /api/v1/auth/login` → сохранить токены (BFF route заменён с demo → реальный backend)
- [x] Auth guard — redirect на `/login` если пользователь не авторизован
- [x] Redirect на `/dashboard` после успешного логина
- [x] BFF route `/api/auth/refresh` для обновления токенов
- [x] BFF route `/api/auth/logout` с отзывом сессии на backend
- [x] После логина → `GET /api/v1/users/me` → обновить tenantId в сессии

### 1.3 Layout (Shell)
- [x] Sidebar с навигацией (свернуть/развернуть)
- [x] Header: имя пользователя, роль, кнопка выхода
- [x] Responsive: на мобильных sidebar → drawer/бургер
- [x] Breadcrumbs
- [x] Пункты sidebar фильтруются по роли (filterNavByRole в AppShell)

### 1.4 Профиль пользователя
- [x] Страница `/profile` — просмотр + редактирование имени
- [x] `GET /api/v1/users/me`, `PATCH /api/v1/users/me`
- [x] Смена пароля: `POST /api/v1/auth/change-password`
- [x] Список активных сессий: `GET /api/v1/auth/sessions`
- [x] Отзыв сессии: `DELETE /api/v1/auth/sessions/:id`

### Критерии завершения:
- [x] Логин/логаут работает (с реальным backend)
- [x] Refresh token работает (не выкидывает при истечении access)
- [x] Профиль можно смотреть и редактировать
- [x] Sidebar с навигацией по роли

---

## Фаза 2: Дашборд

> **Цель:** главная страница с ключевыми метриками и графиками.
> **Зависит от:** Фаза 1

### 2.1 Виджеты метрик
- [x] Карточки: Всего квартир / Свободно / Активных сделок / Просроченных платежей
- [x] Карточки: Выручка всего / Выручка за месяц / Дебиторка / Забронировано
- [x] API: `GET /api/v1/dashboard/summary?property_id=...`
- [x] Фильтр по объекту (property_id) — AppSelect dropdown сверху

### 2.2 Графики
- [x] Продажи по месяцам (bar chart) — `GET /api/v1/dashboard/sales?from=...&to=...`
- [x] KPI менеджеров (таблица) — `GET /api/v1/dashboard/manager-kpi`
- [x] По типам оплаты (doughnut chart — квартиры по статусу на дашборде; pie chart на странице аналитики объекта)
- [x] Воронка конверсии (funnel) — из данных pipeline board

### 2.3 Аналитика объекта
- [x] Страница `/dashboard/properties/:id` — KPI, графики, pie charts, таблица по типам оплаты

### Критерии завершения:
- [x] Дашборд отображает актуальные данные
- [x] Фильтр по объекту работает
- [x] Графики рендерятся корректно

---

## Фаза 3: Объекты недвижимости и шахматка

> **Цель:** CRUD объектов, шахматная доска квартир — ключевой UI для продажников.
> **Зависит от:** Фаза 1

### 3.1 Список объектов
- [x] Страница `/properties` — таблица с поиском, фильтрами, реальный API
- [x] API: `GET /api/v1/properties?page=1&limit=20&search=...&status=...`
- [x] Модуль `src/modules/properties/` — domain, infrastructure, hooks
- [x] Кнопка "Создать объект" + AppDrawerForm (name, type, address, city, currency, dates)

### 3.2 Создание/редактирование объекта
- [x] Drawer/форма: название, адрес, город, валюта, даты
- [x] API: `POST /api/v1/properties`, `PATCH /api/v1/properties/:id`
- [x] Удаление: `DELETE /api/v1/properties/:id` (с ConfirmDialog)

### 3.3 Блоки и этажи
- [x] Список блоков: `GET /api/v1/properties/:id/blocks` — hook готов
- [x] Страница `/buildings/:id` с AppTabs: Блоки | Квартиры | Шахматка
- [x] Добавить блок UI (AppDrawerForm: name, floorsCount, undergroundFloors)

### 3.4 Шахматка (Chess Board) — ключевой UI
- [x] API: `GET /api/v1/properties/:id/chessboard?status=...&rooms=...&price_min=...&price_max=...`
- [x] Цветовая кодировка по статусу (available→free=зел, booked=жёлт, reserved=синий, sold=красный)
- [x] Клик на квартиру → Drawer с деталями (номер, площадь, цена, статус)
- [x] Фильтры: по статусу, комнатности, диапазону цен
- [x] Действия: забронировать, отменить бронь, резервировать
- [x] Создать сделку из шахматки — ссылка из unit detail drawer на создание сделки

### 3.5 Управление квартирами
- [x] Смена статуса: `PATCH /api/v1/units/:id/status` — мутации готовы
- [x] Список квартир страница (`/buildings/:id/units`) — фильтры по статусу/блоку/комнатам
- [x] Создание квартир (AppDrawerForm) + массовое создание (bulk: numberFrom..numberTo)

### Критерии завершения:
- [x] Шахматка рендерится с цветами по статусу
- [x] Бронирование из шахматки работает
- [x] CRUD объектов/блоков/квартир

---

## Фаза 4: CRM — клиенты и воронка продаж

> **Цель:** менеджеры ведут клиентов, канбан-доска воронки.
> **Зависит от:** Фаза 1

### 4.1 Список клиентов
- [x] Страница `/clients` — таблица с поиском, фильтрами, реальный API
- [x] API: `GET /api/v1/clients?page=...&search=...&source=...&manager_id=...&pipeline_stage_id=...`
- [x] Колонки: ФИО, телефон, источник, менеджер, этап, дата создания

### 4.2 Создание/редактирование клиента
- [x] AppDrawerForm: ФИО, телефон, доп. телефон, WhatsApp, Telegram, email, источник, заметки
- [x] API: `POST /api/v1/clients`, `PATCH /api/v1/clients/:id`

### 4.3 Карточка клиента
- [x] Страница `/clients/:id` — AppTabs (Информация | Взаимодействия | Сделки)
- [x] Смена этапа: `PATCH /api/v1/clients/:id/stage`
- [x] История взаимодействий + добавление (AppCommentThread)
- [x] Смена менеджера UI (диалог с AppSelect менеджеров)

### 4.4 Канбан-доска воронки
- [x] Страница `/pipeline` — AppKanbanBoard с drag-and-drop
- [x] API: `GET /api/v1/pipeline/board`
- [x] Drag-and-drop с оптимистичными обновлениями + rollback
- [x] Фильтр по источнику
- [x] Фильтр по менеджеру (AppSelect из списка пользователей)

### 4.5 Настройка этапов воронки (admin)
- [x] Страница `/settings/pipeline` — CRUD этапов (AppDataTable + AppDrawerForm + ConfirmDialog)

### Критерии завершения:
- [x] Канбан-доска с drag-and-drop работает
- [x] CRUD клиентов с поиском и фильтрами
- [x] История взаимодействий отображается

---

## Фаза 5: Сделки и платежи

> **Цель:** создание сделок, графики рассрочки, приём и подтверждение платежей.
> **Зависит от:** Фаза 3, Фаза 4

### 5.1 Список сделок
- [x] Страница `/deals` — таблица с фильтрами, реальный API
- [x] API: `GET /api/v1/deals?status=...&property_id=...&client_id=...`
- [x] Колонки: номер, клиент, квартира, объект, сумма, тип оплаты, статус, дата

### 5.2 Создание сделки
- [x] 3-шаговый wizard (AppStepWizard): клиент+квартира → тип оплаты → подтверждение
- [x] Все типы оплаты с условными полями + live-расчёт рассрочки
- [x] API: `POST /api/v1/deals`

### 5.3 Карточка сделки
- [x] Страница `/deals/:id` с AppTabs
- [x] Действия: Активировать, Завершить, Отменить с API

### 5.4 График платежей
- [x] AppPaymentTimeline с цветовой кодировкой
- [x] API: `GET /api/v1/deals/:id/schedule`
- [x] Редактирование позиции графика (диалог: дата + сумма, PATCH /api/v1/deals/:id/schedule/:item_id)

### 5.5 Приём платежей
- [x] Drawer: сумма, валюта, метод оплаты, заметки
- [x] API: `POST /api/v1/payments`
- [x] Список платежей по сделке
- [x] Подтверждение/отклонение платежей (кнопки на pending платежах + ConfirmDialog)

### 5.6 Ближайшие платежи
- [x] Страница `/payments` — фильтры месяц/год/объект/статус, AppDataTable, реальный API

### 5.7 Просроченные платежи
- [x] Страница `/payments/overdue` — KPI, AppDataTable, кнопка "Позвонить", auto-refresh 5 мин

### Критерии завершения:
- [x] Полный цикл сделки в UI
- [x] График рассрочки отображается и редактируется
- [x] Платежи принимаются и подтверждаются/отклоняются
- [x] Ближайшие и просроченные платежи видны

---

## Фаза 6: Финансы

> **Цель:** финансовый учёт — счета, операции, отчёты.
> **Зависит от:** Фаза 5

### 6.1 Счета (кассы и банки)
- [x] Страница `/finance/accounts` — список с балансами
- [x] CRUD: `GET/POST/PATCH /api/v1/accounts`
- [x] Типы: bank_account, cash_register, mobile_wallet

### 6.2 Валюты и курсы
- [x] Страница `/finance/currencies` — AppTabs: Валюты | Курсы обмена
- [x] API: `GET/POST /api/v1/currencies`, `POST /api/v1/currencies/:id/primary`
- [x] Курсы: `GET/POST /api/v1/exchange-rates`

### 6.3 Категории расходов
- [x] Страница `/finance/categories` — список с родительскими связями
- [x] API: `GET/POST/DELETE /api/v1/expense-categories`

### 6.4 Журнал операций
- [x] Страница `/finance/transactions` — таблица с фильтрами
- [x] API: `GET /api/v1/transactions?type=...&account_id=...&date_from=...&date_to=...`
- [x] Создание: модалка выбора типа (доход/расход/перевод) → форма
- [x] API: `POST /api/v1/transactions`

### 6.5 Отчёты
- [x] Доходы/расходы: `GET /api/v1/reports/income-expense?from=...&to=...&property_id=...`
- [x] Движение денег: `GET /api/v1/reports/cash-flow?from=...&to=...`
- [x] Дебиторка: `GET /api/v1/reports/receivables?property_id=...`
- [x] Себестоимость: `GET /api/v1/reports/property-cost/:id`
- [x] UI: таблицы + графики, фильтры по периоду и объекту

### 6.6 Напоминалки по платежам
- [x] Страница `/finance/payable-reminders` — список обещанных платежей поставщикам/подрядчикам
- [x] API: `GET /api/v1/payable-reminders?status=pending&payee_type=...`
- [x] Создание: модалка (кому, сколько, когда, описание, тип получателя)
- [x] API: `POST /api/v1/payable-reminders`
- [x] Действия: Отметить оплаченным (`POST /:id/mark-paid`), Отменить (`POST /:id/cancel`), Удалить (`DELETE /:id`)
- [x] Сортировка: ближайшая дата оплаты первой
- [x] Красная подсветка просроченных (due_date < today && status == pending)

### Критерии завершения:
- [x] Баланс счетов обновляется при операциях
- [x] Отчёты отображают данные за период
- [x] Напоминалки работают

---

## Фаза 7: Склад и мастера

> **Цель:** учёт стройматериалов, поставщиков, мастеров и нарядов.
> **Зависит от:** Фаза 1

### 7.1 Поставщики
- [x] Страница `/warehouse/suppliers` — список + баланс (задолженность)
- [x] API: `GET /api/v1/suppliers`, `POST /api/v1/suppliers`
- [x] Карточка поставщика: баланс, история платежей, выписка
- [x] API: `GET /:id/balance`, `GET /:id/payments`, `GET /:id/statement`
- [x] Оплата поставщику: `POST /api/v1/suppliers/:id/payments`
- [x] Все балансы: `GET /api/v1/supplier-balances`

### 7.2 Материалы
- [x] Страница `/warehouse/materials` — список с остатками
- [x] API: `GET/POST/DELETE /api/v1/materials`
- [x] Подсветка: остаток ниже минимума → красный

### 7.3 Движение склада
- [x] Страница `/warehouse/movements` — журнал приход/расход
- [x] API: `GET /api/v1/stock-movements?material_id=...&supplier_id=...`
- [x] Создание: `POST /api/v1/stock-movements` (тип, материал, количество, поставщик)

### 7.4 Мастера
- [x] Страница `/masters` — список мастеров/бригад
- [x] API: `GET/POST/PATCH/DELETE /api/v1/masters`

### 7.5 Наряды
- [x] Страница `/work-orders` — список с фильтрами (статус, мастер, объект)
- [x] API: `GET/POST /api/v1/work-orders`
- [x] Lifecycle: Создать → Начать (`/start`) → Завершить (`/complete` + actual_amount) → Принять (`/accept`)

### Критерии завершения:
- [x] Складской учёт: приход/расход, автоматический пересчёт остатков
- [x] Баланс задолженности поставщикам
- [x] Наряды с lifecycle

---

## Фаза 8: Документы и SMS

> **Цель:** генерация договоров, SMS-рассылки.
> **Зависит от:** Фаза 5

### 8.1 Шаблоны договоров
- [x] Страница `/settings/templates` — список шаблонов
- [x] API: `GET/POST/PATCH/DELETE /api/v1/contract-templates`
- [x] Создание: название, тип, тело с плейсхолдерами ({{client_name}}, {{deal_number}}, и т.д.)
- [x] Генерация: `POST /api/v1/deals/:id/generate-contract` → HTML preview
- [x] Кнопка "Скачать PDF" (jsPDF + Cyrillic font, fallback на HTML)

### 8.2 SMS
- [x] Страница `/settings/sms-templates` — CRUD шаблонов
- [x] API: `GET/POST /api/v1/sms-templates`
- [x] Отправка: модалка (телефон, текст) → `POST /api/v1/sms/send`
- [x] Массовая: `POST /api/v1/sms/bulk-send` (диалог с textarea телефонов по строкам)
- [x] Логи: `GET /api/v1/sms/logs`

### Критерии завершения:
- [x] Договоры генерируются из шаблонов
- [x] SMS отправляются и логируются

---

## Фаза 9: Администрирование

> **Цель:** управление тенантами (super_admin), пользователями, настройками.
> **Зависит от:** Фаза 1

### 9.1 Управление тенантами (super_admin)
- [x] Страница `/admin/tenants` — список компаний
- [x] CRUD: `GET/POST/PATCH /api/v1/super-admin/tenants`
- [x] Действия: активировать/деактивировать, назначить подписку
- [x] Поиск, фильтр по статусу

### 9.2 Управление пользователями (company_admin)
- [x] Страница `/settings/users` — список сотрудников тенанта
- [x] API: `GET /api/v1/admin/users`, `POST /api/v1/admin/users` (создание)
- [x] Действия: изменить роль (`PATCH /:id/role`), вкл/выкл доступ (`PATCH /:id/can-login`)

### 9.3 Настройки компании
- [x] Страница `/settings/company` — key-value настройки
- [x] API: `GET/POST /api/v1/settings`
- [x] Настройки: срок бронирования, ставка пени, макс. скидка, основная валюта

### 9.4 Земельные участки
- [x] Страница `/land` — список участков (AppDataTable + create/edit AppDrawerForm + delete ConfirmDialog)
- [x] API: `GET/POST/PATCH/DELETE /api/v1/land-plots`
- [x] Страница `/land/:id` — детали + вкладка "Владельцы" (AppDataTable + add/delete)
- [x] Владельцы: `GET/POST/DELETE /api/v1/land-plots/:id/owners`

### 9.5 Продвинутые фичи
- [x] Правила ценообразования: `/settings/pricing-rules` — фильтр по объекту, CRUD таблица
- [x] Брокеры: `/settings/brokers` — список + создание + сделки брокера + удаление
- [x] Биллинг: `/settings/invoices` — фильтр по статусу + оплата с ConfirmDialog

### Критерии завершения:
- [x] Super admin может управлять тенантами
- [x] Admin может управлять пользователями
- [x] Настройки работают

---

## Фаза 10: Полировка и production

> **Цель:** финальная доработка, оптимизация, подготовка к продакшену.
> **Зависит от:** все предыдущие фазы

### 10.1 UX/UI
- [x] Skeleton loaders для таблиц и карточек (loading.tsx для всех 14+ маршрутов)
- [x] Toast уведомления при действиях (ToastProvider + useToast: showSuccess/showError/showInfo)
- [x] Подтверждение удаления (ConfirmDialog используется во всех CRUD-страницах)
- [x] Empty states для пустых списков (AppStatePanel tone="empty" во всех таблицах)
- [x] Loading states для кнопок (isLoading prop на AppButton во всех мутациях)

### 10.2 Мобильная адаптация
- [x] Responsive таблицы (AppDataTable уже responsive)
- [x] Sidebar → drawer на мобильных (MUI Drawer + hamburger кнопка, md:hidden)
- [x] Шахматка → горизонтальный скролл на мобильных (overflow-x-auto уже есть)
- [x] Touch-friendly канбан-доска (touch-action: manipulation + overflow-x-auto)

### 10.3 Production
- [x] Environment variables (Zod-валидация в env.ts: client + server)
- [x] Error boundary + fallback UI (error.tsx для admin и root уровня)
- [x] Docker build для фронтенда (multi-stage Dockerfile + .dockerignore + output: standalone)

### Критерии завершения:
- [x] Всё работает на мобильных
- [x] Нет console errors (npx tsc --noEmit + npm run build проходят)

---

## Справочная информация

### Полная API документация
`docs/api/openapi.yaml` — OpenAPI 3.0.3, ~3400 строк, ~160 эндпоинтов

### Статусы (lifecycle)

**Квартиры:** available → booked → sold (или reserved, released)
**Сделки:** draft → active → completed | cancelled
**Платежи (входящие):** pending → confirmed | rejected
**Графики рассрочки:** pending → upcoming → paid | partially_paid | overdue
**Наряды:** draft → in_progress → completed → accepted
**Напоминалки (исходящие):** pending → paid | cancelled
**Движение склада:** income, expense, write_off, return

### Enum'ы

**Roles:** super_admin, company_admin, sales_head, manager, accountant, cashier, foreman, warehouse_manager, broker
**Payment types:** full_payment, installment, mortgage, barter, combined
**Payment methods:** cash, bank_transfer, mobile
**Payee types (напоминалки):** supplier, contractor, master, other
**Account types:** bank_account, cash_register, mobile_wallet
**Валюты по умолчанию:** TJS (сомони), USD, RUB

---

## Для агента: как работать

1. **Перед началом** — прочитай этот файл и `docs/api/openapi.yaml`
2. **Фазы идут по порядку** — не перескакивай, каждая зависит от предыдущей
3. **Используй готовый стек проекта** — не меняй фреймворк, библиотеки, структуру. Работай с тем что есть
4. **Все данные только через API** — никаких моков, захардкоженных данных
5. **Типизация** — все ответы и запросы должны быть типизированы
6. **Переиспользуемые компоненты** — DataTable, Modal, Form wrapper создавай один раз, используй везде
7. **Отмечай прогресс:** `- [ ]` → `- [x]` в этом файле
8. **Тестируй:** каждая фаза должна работать end-to-end с бэкендом

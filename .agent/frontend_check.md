# Frontend API Check — BuildCRM

> Дата: 2026-03-18
> Сервер: `http://localhost:8080`
> Все запросы требуют заголовок: `Authorization: Bearer <access_token>`

---

## 1. Авторизация

### POST `/api/v1/auth/login`

```json
// Request
{ "email": "admin@demo.com", "password": "Admin123!" }

// Response
{
  "data": {
    "access_token": "eyJ...",
    "access_token_expires_at": "2026-03-18T09:00:29Z",
    "refresh_token": "Rmzm1s...",
    "refresh_token_expires_at": "2026-03-25T08:45:29Z",
    "user": {
      "id": "uuid",
      "email": "admin@demo.com",
      "full_name": "Алишер Каримов",
      "role": "company_admin",
      "can_login": true,
      "created_at": "2026-03-18T07:18:24Z",
      "updated_at": "2026-03-18T07:18:24Z"
    }
  }
}
```

---

## 2. Универсальный формат ответов

### КРИТИЧНО — все данные всегда в обёртке `data`

```js
// НЕПРАВИЛЬНО:
const items = response.items        // undefined!
const total = response.total        // undefined!

// ПРАВИЛЬНО:
const items = response.data.items
const total = response.data.pagination.total
```

### Список с пагинацией

```json
{
  "data": {
    "items": [ {...}, {...} ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100
    }
  }
}
```

Параметры запроса: `?page=1&limit=20`

### Одна запись

```json
{ "data": { "id": "uuid", ... } }
```

### Ошибка

```json
{ "code": "NOT_FOUND", "message": "not found" }
```

Коды ошибок: `NOT_FOUND` | `UNAUTHORIZED` | `FORBIDDEN` | `BAD_REQUEST` | `CONFLICT` | `INTERNAL_ERROR`

---

## 3. ВАЖНО: два стиля ключей в ответах

В API есть **два разных формата** полей в зависимости от раздела:

| Формат | Разделы |
|--------|---------|
| `snake_case` | units, deals, clients, properties, payments, schedule, pipeline, dashboard |
| `PascalCase` ⚠️ | accounts, transactions, masters, work-orders, suppliers, materials, land-plots, sms-templates |

Разделы с `PascalCase` — баг на бэкенде (планируется исправить). Фронтенд должен обрабатывать оба формата.

---

## 4. Объекты (Properties)

### GET `/api/v1/properties?page=1&limit=20`

```json
{
  "data": {
    "items": [{
      "id": "uuid",
      "tenant_id": "uuid",
      "name": "ЖК «Садовый»",
      "address": "ул. Садовая, 12",
      "city": "Душанбе",
      "district": "Сино",
      "property_type": "residential_complex",
      "status": "construction",
      "description": "16-этажный жилой комплекс...",
      "currency": "USD",
      "total_units": 48,
      "sold_units": 8,
      "realization_percent": 16.67,
      "construction_start_date": "2023-03-01",
      "construction_end_date": "2025-12-31",
      "created_at": "2026-03-18T07:18:24Z",
      "updated_at": "2026-03-18T07:18:24Z"
    }],
    "pagination": { "page": 1, "limit": 20, "total": 2 }
  }
}
```

Статусы: `planning` | `construction` | `completed` | `suspended`

### GET `/api/v1/properties/:id/blocks`

```json
{
  "data": [
    {
      "id": "uuid",
      "property_id": "uuid",
      "name": "Блок А",
      "floors_count": 16,
      "underground_floors": 0,
      "sort_order": 1,
      "created_at": "2026-03-18T07:18:24Z"
    }
  ]
}
```

### GET `/api/v1/properties/:id/chessboard`

Query params: `?status=available&rooms=2&price_min=10000&price_max=100000&unit_type=apartment`

```json
{
  "data": {
    "blocks": [{
      "block_id": "uuid",
      "block_name": "Блок А",
      "floors_count": 16,
      "floors": [{
        "floor_number": 4,
        "units": [{
          "id": "uuid",
          "unit_number": "401",
          "unit_type": "apartment",
          "rooms": 2,
          "total_area": 65.2,
          "current_price": 47000,
          "price_per_sqm": 720,
          "status": "available",
          "position": ""
        }]
      }]
    }]
  }
}
```

Этажи отсортированы **сверху вниз** (убывание `floor_number`).

---

## 5. Квартиры (Units)

### GET `/api/v1/units?page=1&limit=20`

Query params: `?property_id=uuid&block_id=uuid&status=available&rooms=2&price_min=&price_max=&sort_by=unit_number&sort_order=asc`

```json
{
  "data": {
    "items": [{
      "id": "uuid",
      "tenant_id": "uuid",
      "property_id": "uuid",
      "block_id": "uuid",
      "floor_id": "uuid",
      "unit_number": "101",
      "unit_type": "apartment",
      "rooms": 1,
      "total_area": 44.5,
      "living_area": 28.0,
      "kitchen_area": 10.0,
      "balcony_area": null,
      "floor_number": 1,
      "base_price": 26700,
      "current_price": 26700,
      "price_per_sqm": 600,
      "status": "available",
      "finishing": "rough",
      "layout_url": "",
      "description": "",
      "position": "",
      "booked_until": "",
      "created_at": "2026-03-18T07:18:24Z",
      "updated_at": "2026-03-18T07:18:24Z"
    }],
    "pagination": { "page": 1, "limit": 20, "total": 16 }
  }
}
```

Статусы unit: `available` | `booked` | `reserved` | `sold`
Типы: `apartment` | `studio` | `penthouse` | `office` | `commercial` | `parking` | `storage`
Отделка: `rough` | `fine` | `white_box` | `none`

---

## 6. Pipeline / CRM

### GET `/api/v1/pipeline/board`

```json
{
  "data": {
    "columns": [{
      "stage": {
        "id": "uuid",
        "tenant_id": "uuid",
        "name": "Новый",
        "slug": "new",
        "color": "#6B7280",
        "sort_order": 1,
        "is_final": false,
        "is_default": true,
        "created_at": "2026-03-18T07:18:24Z"
      },
      "clients": [{
        "id": "uuid",
        "tenant_id": "uuid",
        "full_name": "Дильнора Рахимова",
        "phone": "+992 900 111006",
        "email": "dilnora@gmail.com",
        "address": "г. Душанбе, ул. Бохтар, 7",
        "source": "facebook",
        "assigned_manager_id": "uuid",
        "pipeline_stage_id": "uuid",
        "notes": "Новый лид.",
        "created_at": "2026-03-16T07:18:24Z",
        "updated_at": "2026-03-18T07:18:24Z"
      }],
      "count": 1
    }]
  }
}
```

---

## 7. Клиенты (Clients)

### GET `/api/v1/clients?page=1&limit=20`

Query params: `?search=&source=&manager_id=&pipeline_stage_id=&sort_by=created_at&sort_order=desc`

```json
{
  "data": {
    "items": [{
      "id": "uuid",
      "tenant_id": "uuid",
      "full_name": "Рустам Назаров",
      "phone": "+992 900 111001",
      "email": "rustam@mail.ru",
      "address": "г. Душанбе, ул. Ленина, 5",
      "source": "instagram",
      "assigned_manager_id": "uuid",
      "pipeline_stage_id": "uuid",
      "notes": "Купил квартиру 102.",
      "created_at": "2026-01-17T07:18:24Z",
      "updated_at": "2026-03-18T07:18:24Z"
    }],
    "pagination": { "page": 1, "limit": 20, "total": 6 }
  }
}
```

Источники: `instagram` | `facebook` | `website` | `referral` | `direct` | `other`

### GET `/api/v1/clients/:id/interactions`

```json
{
  "data": {
    "items": [{
      "id": "uuid",
      "client_id": "uuid",
      "user_id": "uuid",
      "interaction_type": "call",
      "description": "Первичный звонок.",
      "created_at": "2026-03-18T07:18:24Z"
    }]
  }
}
```

Типы: `call` | `meeting` | `message` | `email` | `whatsapp`

---

## 8. Сделки (Deals)

### GET `/api/v1/deals?page=1&limit=20`

```json
{
  "data": {
    "items": [{
      "id": "uuid",
      "tenant_id": "uuid",
      "deal_number": "D-0001",
      "client_id": "uuid",
      "unit_id": "uuid",
      "manager_id": "uuid",
      "payment_type": "full_payment",
      "total_amount": 45640,
      "currency": "USD",
      "discount_amount": 0,
      "discount_reason": "",
      "surcharge_amount": 0,
      "final_amount": 45640,
      "down_payment": 45640,
      "installment_months": null,
      "installment_frequency": "",
      "status": "completed",
      "contract_number": "CNT-2024-001",
      "notes": "",
      "signed_at": "2026-01-19T07:18:24Z",
      "completed_at": null,
      "cancelled_at": null,
      "cancellation_reason": "",
      "created_at": "2026-01-17T07:18:24Z",
      "updated_at": "2026-03-18T07:18:24Z"
    }],
    "pagination": { "page": 1, "limit": 20, "total": 5 }
  }
}
```

Типы оплаты: `full_payment` | `installment` | `mortgage`
Статусы: `draft` | `active` | `completed` | `cancelled`

### GET `/api/v1/deals/:id/schedule`

```json
{
  "data": {
    "items": [{
      "id": "uuid",
      "deal_id": "uuid",
      "payment_number": 1,
      "due_date": "2026-02-01",
      "planned_amount": 14000,
      "paid_amount": 14000,
      "status": "paid",
      "penalty_amount": 0,
      "remaining": 0
    }]
  }
}
```

Статусы: `pending` | `paid` | `overdue` | `partial`

---

## 9. Платежи (Payments)

### GET `/api/v1/payments?page=1&limit=20`

Query params: `?deal_id=&client_id=&status=`

```json
{
  "data": {
    "items": [{
      "id": "uuid",
      "deal_id": "uuid",
      "schedule_item_id": "uuid",
      "client_id": "uuid",
      "amount": 3111.11,
      "currency": "USD",
      "exchange_rate": 1,
      "amount_in_deal_currency": 3111.11,
      "payment_method": "cash",
      "account_id": "uuid",
      "status": "confirmed",
      "receipt_number": "",
      "paid_at": "2026-03-03T07:18:24Z",
      "confirmed_at": "2026-03-03T07:18:24Z",
      "created_at": "2026-03-18T07:18:24Z"
    }],
    "pagination": { "page": 1, "limit": 20, "total": 5 }
  }
}
```

Методы оплаты: `cash` | `bank_transfer` | `card` | `online`
Статусы: `pending` | `confirmed` | `rejected`

---

## 10. Дашборд

### GET `/api/v1/dashboard/summary`

```json
{
  "data": {
    "total_units": 16,
    "sold_units": 4,
    "available_units": 10,
    "booked_units": 0,
    "reserved_units": 2,
    "total_revenue": 152751.11,
    "total_debt": 159777.78,
    "account_balance": 350000,
    "active_deals": 2,
    "total_clients": 6,
    "overdue_count": 0
  }
}
```

### GET `/api/v1/dashboard/sales`

```json
{
  "data": {
    "total_deals": 1,
    "total_amount": 72000,
    "average_deal": 72000,
    "funnel_conversion": {
      "total_leads": 3,
      "total_deals": 1,
      "conversion_pct": 33.33
    },
    "by_payment_type": [
      { "payment_type": "installment", "count": 1, "total_amount": 72000 }
    ],
    "monthly_sales": [
      { "month": "2026-03", "count": 1, "total_amount": 72000 }
    ]
  }
}
```

### GET `/api/v1/dashboard/manager-kpi`

```json
{
  "data": {
    "items": [{
      "manager_id": "uuid",
      "manager_name": "Бахром Усманов",
      "deals_count": 1,
      "total_amount": 72000,
      "client_count": 1
    }]
  }
}
```

---

## 11. Финансы (⚠️ PascalCase — баг бэкенда)

### GET `/api/v1/accounts`

```json
{
  "data": {
    "items": [{
      "ID": "uuid",
      "TenantID": "uuid",
      "Name": "Главная касса",
      "AccountType": "cash",
      "BankName": "",
      "AccountNumber": "",
      "Currency": "USD",
      "InitialBalance": 50000,
      "CurrentBalance": 50000,
      "ResponsibleUserID": "uuid",
      "IsActive": true,
      "CreatedAt": "2026-03-18T07:18:24.264988Z",
      "UpdatedAt": "2026-03-18T07:18:24.264988Z",
      "DeletedAt": null
    }]
  }
}
```

Типы: `cash` | `bank_account` | `card`

### GET `/api/v1/transactions?page=1&limit=20`

```json
{
  "data": {
    "items": [{
      "ID": "uuid",
      "TenantID": "uuid",
      "TransactionType": "expense",
      "CategoryID": "uuid",
      "AccountID": "uuid",
      "ToAccountID": null,
      "Amount": 1200,
      "Currency": "USD",
      "ExchangeRate": 1,
      "AmountInPrimaryCurrency": 1200,
      "Description": "Аренда транспорта",
      "ReferenceType": "",
      "ReferenceID": null,
      "PropertyID": "uuid",
      "CreatedBy": "uuid",
      "TransactionDate": "2026-03-15T00:00:00Z",
      "CreatedAt": "2026-03-18T07:18:24.264988Z"
    }],
    "pagination": { "page": 1, "limit": 20, "total": 12 }
  }
}
```

Типы: `income` | `expense` | `transfer`

---

## 12. Мастера и Наряды (⚠️ PascalCase — баг бэкенда)

### GET `/api/v1/masters?page=1&limit=20`

```json
{
  "data": {
    "items": [{
      "ID": "uuid",
      "TenantID": "uuid",
      "FullName": "Отабек Мирзоев",
      "Phone": "+992 900 300001",
      "Specialization": "Монолитные работы",
      "CompanyName": "Бригада Мирзоева",
      "Notes": "",
      "IsActive": true,
      "CreatedAt": "2026-03-18T07:18:24.264988Z",
      "UpdatedAt": "2026-03-18T07:18:24.264988Z",
      "DeletedAt": null
    }]
  }
}
```

### GET `/api/v1/work-orders?page=1&limit=20`

```json
{
  "data": {
    "items": [{
      "ID": "uuid",
      "TenantID": "uuid",
      "MasterID": "uuid",
      "PropertyID": "uuid",
      "Title": "Монолитные работы — этажи 1-4",
      "Description": "Заливка перекрытий",
      "PlannedAmount": 18000,
      "ActualAmount": 18000,
      "Currency": "USD",
      "Status": "completed",
      "StartedAt": "2026-01-27T00:00:00Z",
      "CompletedAt": "2026-02-26T00:00:00Z",
      "AcceptedAt": null,
      "AcceptedBy": null,
      "Notes": "",
      "CreatedAt": "2026-03-18T07:18:24.264988Z",
      "UpdatedAt": "2026-03-18T07:18:24.264988Z"
    }],
    "pagination": { "page": 1, "limit": 20, "total": 3 }
  }
}
```

Статусы: `draft` | `in_progress` | `completed` | `accepted` | `cancelled`

---

## 13. Склад (⚠️ PascalCase — баг бэкенда)

### GET `/api/v1/suppliers`

```json
{
  "data": {
    "items": [{
      "ID": "uuid",
      "Name": "ООО «СтройТрейд»",
      "ContactPerson": "Исмоил Назаров",
      "Phone": "+992 900 200001",
      "Email": "stroytrade@mail.tj",
      "Address": "",
      "Notes": "Основной поставщик цемента",
      "IsActive": true,
      "TotalPurchased": 0,
      "TotalPaid": 0,
      "CreatedAt": "...",
      "UpdatedAt": "...",
      "DeletedAt": null
    }]
  }
}
```

### GET `/api/v1/materials`

```json
{
  "data": {
    "items": [{
      "ID": "uuid",
      "Name": "Цемент М500",
      "SKU": "CEM-500",
      "Unit": "мешок",
      "CurrentStock": 320,
      "MinStock": 50,
      "PricePerUnit": 8.5,
      "Currency": "USD",
      "CategoryID": "uuid",
      "Notes": "",
      "CreatedAt": "...",
      "UpdatedAt": "...",
      "DeletedAt": null
    }]
  }
}
```

---

## 14. Земельные участки (⚠️ PascalCase — баг бэкенда)

### GET `/api/v1/land-plots`

```json
{
  "data": {
    "items": [{
      "ID": "uuid",
      "TenantID": "uuid",
      "PropertyID": "uuid",
      "Address": "г. Душанбе, ул. Садовая, 12",
      "CadastralNumber": "11:01:0101001:123",
      "AreaSqm": 3200,
      "Status": "owned",
      "Notes": "Участок под ЖК Садовый.",
      "CreatedAt": "...",
      "UpdatedAt": "...",
      "DeletedAt": null
    }]
  }
}
```

Статусы: `owned` | `leased` | `negotiation` | `other`

---

## 15. SMS Шаблоны (⚠️ PascalCase — баг бэкенда)

### GET `/api/v1/sms-templates`

```json
{
  "data": {
    "items": [{
      "ID": "uuid",
      "TenantID": "uuid",
      "Name": "Напоминание о платеже",
      "EventType": "payment_due",
      "Body": "Уважаемый {client_name}! Напоминаем о платеже {amount} USD...",
      "IsActive": true,
      "DaysBefore": 3,
      "CreatedAt": "...",
      "UpdatedAt": "..."
    }]
  }
}
```

Типы событий: `payment_due` | `payment_received` | `payment_overdue`

---

## 16. Полная таблица эндпоинтов

| Метод | URL | Описание | Формат полей |
|-------|-----|----------|--------------|
| POST | `/api/v1/auth/login` | Вход | snake_case |
| POST | `/api/v1/auth/refresh` | Обновить токен | snake_case |
| GET | `/api/v1/properties` | Список объектов | snake_case |
| GET | `/api/v1/properties/:id` | Объект | snake_case |
| GET | `/api/v1/properties/:id/blocks` | Блоки объекта | snake_case |
| GET | `/api/v1/properties/:id/chessboard` | Шахматка | snake_case |
| GET | `/api/v1/units` | Список квартир | snake_case |
| GET | `/api/v1/units/:id` | Квартира | snake_case |
| PATCH | `/api/v1/units/:id/status` | Изменить статус квартиры | snake_case |
| GET | `/api/v1/pipeline/board` | Доска CRM | snake_case |
| GET | `/api/v1/clients` | Список клиентов | snake_case |
| GET | `/api/v1/clients/:id` | Клиент | snake_case |
| GET | `/api/v1/clients/:id/interactions` | Взаимодействия | snake_case |
| GET | `/api/v1/deals` | Список сделок | snake_case |
| GET | `/api/v1/deals/:id` | Сделка | snake_case |
| GET | `/api/v1/deals/:id/schedule` | График платежей | snake_case |
| GET | `/api/v1/payments` | Список платежей | snake_case |
| GET | `/api/v1/dashboard/summary` | Сводка дашборда | snake_case |
| GET | `/api/v1/dashboard/sales` | Продажи | snake_case |
| GET | `/api/v1/dashboard/manager-kpi` | KPI менеджеров | snake_case |
| GET | `/api/v1/accounts` | Счета | ⚠️ PascalCase |
| GET | `/api/v1/transactions` | Транзакции | ⚠️ PascalCase |
| GET | `/api/v1/masters` | Мастера | ⚠️ PascalCase |
| GET | `/api/v1/work-orders` | Наряды | ⚠️ PascalCase |
| GET | `/api/v1/suppliers` | Поставщики | ⚠️ PascalCase |
| GET | `/api/v1/materials` | Материалы | ⚠️ PascalCase |
| GET | `/api/v1/land-plots` | Земельные участки | ⚠️ PascalCase |
| GET | `/api/v1/sms-templates` | SMS шаблоны | ⚠️ PascalCase |

---

## 17. Тестовые данные

| Роль | Email | Пароль |
|------|-------|--------|
| company_admin | admin@demo.com | Admin123! |
| manager | manager@demo.com | Demo1234 |

**Тестовые UUID:**

| Объект | ID |
|--------|----|
| Tenant | `a1000000-0000-0000-0000-000000000001` |
| ЖК Садовый | `a3000000-0000-0000-0000-000000000001` |
| ЖК Центральный | `a3000000-0000-0000-0000-000000000002` |
| Блок А | `a4000000-0000-0000-0000-000000000001` |
| Блок Б | `a4000000-0000-0000-0000-000000000002` |
| Квартира 101 | `c1000000-0000-0000-0000-000000000101` |
| Сделка D-0002 | `a9000000-0000-0000-0000-000000000002` |
| Клиент Рустам | `a8000000-0000-0000-0000-000000000001` |

# Order Management API Documentation

## Overview
API для управления производственными заказами в ERP-системе. Позволяет создавать, обновлять, отслеживать и управлять заказами на изготовление мебели.

## Base URL
```
https://api.erp-system.com/v1
```

## Authentication
Все запросы требуют Bearer Token аутентификации:
```
Authorization: Bearer <your-jwt-token>
```

## Order Endpoints

### Get Orders List
Получить список заказов с фильтрацией и пагинацией

```
GET /api/orders
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Номер страницы (default: 1) |
| limit | integer | No | Размер страницы (default: 20, max: 100) |
| status | string | No | Фильтр по статусу |
| clientId | integer | No | Фильтр по ID клиента |
| dateFrom | string | No | Фильтр по дате от (ISO 8601) |
| dateTo | string | No | Фильтр по дате до (ISO 8601) |

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "orderNumber": "ORD-2026-001",
      "clientId": 123,
      "clientName": "ООО МебельПрофи",
      "status": "CONFIRMED",
      "paymentStatus": "PARTIALLY_PAID",
      "totalAmount": 45000,
      "deadline": "2026-02-15T15:30:00Z",
      "createdAt": "2026-01-10T10:00:00Z",
      "updatedAt": "2026-01-12T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### Create New Order
Создать новый заказ в статусе DRAFT

```
POST /api/orders
```

**Request Body:**
```json
{
  "clientId": 123,
  "clientName": "ООО МебельПрофи",
  "deadline": "2026-02-15T15:30:00Z",
  "notes": "Срочный заказ на кухонный гарнитур",
  "sections": [
    {
      "sectionNumber": 1,
      "name": "Кухонные фасады",
      "description": "Основные фасады кухонного гарнитура"
    }
  ]
}
```

**Response:**
```json
{
  "id": 1,
  "orderNumber": "ORD-2026-001",
  "clientId": 123,
  "clientName": "ООО МебельПрофи",
  "status": "DRAFT",
  "paymentStatus": "UNPAID",
  "totalAmount": 0,
  "deadline": "2026-02-15T15:30:00Z",
  "notes": "Срочный заказ на кухонный гарнитур",
  "sections": [
    {
      "id": 1,
      "sectionNumber": 1,
      "name": "Кухонные фасады",
      "description": "Основные фасады кухонного гарнитура"
    }
  ],
  "createdAt": "2026-01-13T09:00:00Z"
}
```

### Get Order Details
Получить полную информацию о заказе

```
GET /api/orders/{id}
```

**Response:**
```json
{
  "id": 1,
  "orderNumber": "ORD-2026-001",
  "clientId": 123,
  "clientName": "ООО МебельПрофи",
  "status": "CONFIRMED",
  "paymentStatus": "PARTIALLY_PAID",
  "totalAmount": 45000,
  "deadline": "2026-02-15T15:30:00Z",
  "notes": "Срочный заказ",
  "sections": [
    {
      "id": 1,
      "sectionNumber": 1,
      "name": "Кухонные фасады",
      "description": "Основные фасады",
      "items": [
        {
          "id": 1,
          "productId": 101,
          "productName": "Фасад кухонный",
          "quantity": 12,
          "unitPrice": 2500,
          "totalPrice": 30000,
          "properties": [
            {"propertyId": 1, "propertyName": "Материал", "value": "Массив дуба"},
            {"propertyId": 2, "propertyName": "Цвет", "value": "Натуральный"}
          ]
        }
      ]
    }
  ],
  "auditTrail": [
    {
      "timestamp": "2026-01-12T10:30:00Z",
      "userId": 45,
      "userName": "Иванов И.И.",
      "action": "CONFIRMED",
      "previousStatus": "DRAFT",
      "reason": "Подтверждение менеджером"
    }
  ]
}
```

### Update Order
Обновить информацию о заказе (только для статуса DRAFT)

```
PUT /api/orders/{id}
```

**Request Body:**
```json
{
  "deadline": "2026-02-20T15:30:00Z",
  "notes": "Обновленные требования по срокам"
}
```

### Confirm Order
Подтвердить заказ (перевод из DRAFT в CONFIRMED)

```
PATCH /api/orders/{id}/confirm
```

**Request Body:**
```json
{
  "confirmedBy": 45,
  "confirmationNotes": "Проверены все спецификации"
}
```

### Cancel Order
Отменить заказ

```
PATCH /api/orders/{id}/cancel
```

**Request Body:**
```json
{
  "cancelledBy": 45,
  "cancellationReason": "Отказ клиента",
  "refundAmount": 5000
}
```

### Update Order Status
Изменить статус заказа (для внутреннего использования)

```
PATCH /api/orders/{id}/status
```

**Request Body:**
```json
{
  "status": "PRODUCTION",
  "updatedBy": 45,
  "notes": "Начало производственного процесса"
}
```

## Order Sections Endpoints

### Add Section to Order
Добавить секцию к заказу

```
POST /api/orders/{orderId}/sections
```

**Request Body:**
```json
{
  "sectionNumber": 2,
  "name": "Ящики для кухни",
  "description": "Выдвижные ящики для кухонного гарнитура"
}
```

### Update Section
Обновить информацию о секции

```
PUT /api/orders/{orderId}/sections/{sectionId}
```

### Delete Section
Удалить секцию (только если в ней нет позиций)

```
DELETE /api/orders/{orderId}/sections/{sectionId}
```

## Order Items Endpoints

### Add Item to Section
Добавить позицию в секцию заказа

```
POST /api/orders/{orderId}/sections/{sectionId}/items
```

**Request Body:**
```json
{
  "productId": 102,
  "productName": "Ящик выдвижной",
  "quantity": 6,
  "properties": [
    {"propertyId": 3, "propertyValue": "Полные"},
    {"propertyId": 4, "propertyValue": "Белый глянец"}
  ]
}
```

### Update Item
Обновить позицию заказа

```
PUT /api/orders/{orderId}/sections/{sectionId}/items/{itemId}
```

### Delete Item
Удалить позицию из заказа

```
DELETE /api/orders/{orderId}/sections/{sectionId}/items/{itemId}
```

### Calculate Item Price
Рассчитать стоимость позиции с учетом модификаторов

```
POST /api/orders/{orderId}/sections/{sectionId}/items/{itemId}/calculate-price
```

**Request Body:**
```json
{
  "basePrice": 1500,
  "quantity": 2,
  "coefficient": 1.2,
  "properties": [
    {"propertyId": 1, "propertyValue": "premium"}
  ]
}
```

**Response:**
```json
{
  "basePrice": 1500,
  "unitPrice": 1800,
  "modifiedUnitPrice": 2700,
  "finalPrice": 5400,
  "modifiersApplied": [
    {
      "modifierId": 1,
      "name": "Премиум материал",
      "code": "PREMIUM_MAT",
      "type": "PERCENTAGE",
      "value": 20,
      "appliedValue": 300
    }
  ]
}
```

## Bulk Operations

### Bulk Status Update
Массовое обновление статусов заказов

```
PATCH /api/orders/bulk-status-update
```

**Request Body:**
```json
{
  "orderIds": [1, 2, 3],
  "status": "SHIPPED",
  "updatedBy": 45,
  "notes": "Массовая отгрузка"
}
```

### Bulk Price Recalculation
Массовый пересчет цен для заказов

```
POST /api/orders/bulk-recalculate-prices
```

## Search and Filter

### Advanced Order Search
Поиск заказов по различным критериям

```
POST /api/orders/search
```

**Request Body:**
```json
{
  "filters": {
    "status": ["CONFIRMED", "PRODUCTION"],
    "paymentStatus": "PARTIALLY_PAID",
    "clientId": 123,
    "dateRange": {
      "from": "2026-01-01T00:00:00Z",
      "to": "2026-01-31T23:59:59Z"
    },
    "amountRange": {
      "min": 10000,
      "max": 100000
    }
  },
  "sortBy": "deadline",
  "sortOrder": "asc",
  "page": 1,
  "limit": 20
}
```

## Reports

### Order Summary Report
Генерация сводного отчета по заказам

```
GET /api/orders/reports/summary
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| period | string | Yes | reporting_period (day/week/month/year) |
| dateFrom | string | Yes | Начальная дата |
| dateTo | string | Yes | Конечная дата |

### Production Timeline Report
Отчет по срокам производства

```
GET /api/orders/reports/production-timeline
```

## Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "deadline",
        "message": "Deadline must be in the future"
      }
    ],
    "timestamp": "2026-01-13T09:15:00Z"
  }
}
```

### Common Error Codes
- `ORDER_NOT_FOUND`: Заказ не найден
- `INVALID_STATUS_TRANSITION`: Недопустимый переход статуса
- `INSUFFICIENT_PERMISSIONS`: Недостаточно прав
- `VALIDATION_ERROR`: Ошибка валидации данных
- `ORDER_ALREADY_CONFIRMED`: Заказ уже подтвержден
- `ORDER_HAS_ITEMS`: Нельзя удалить секцию с позициями

## Rate Limiting
- **Authenticated requests**: 1000 requests per hour
- **Unauthenticated requests**: 100 requests per hour

## WebSocket Events
Система поддерживает реалтайм уведомления через WebSocket:

```javascript
// Подписка на события заказов
const ws = new WebSocket('wss://api.erp-system.com/ws');

ws.onopen = () => {
  // Подписка на обновления конкретного заказа
  ws.send(JSON.stringify({
    type: 'SUBSCRIBE_ORDER_UPDATES',
    orderId: 123
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'ORDER_STATUS_CHANGED') {
    console.log('Order status updated:', data.payload);
  }
};
```

### Available WebSocket Events
- `ORDER_CREATED`: Создан новый заказ
- `ORDER_STATUS_CHANGED`: Изменен статус заказа
- `ORDER_ITEM_ADDED`: Добавлена позиция в заказ
- `ORDER_PRICE_UPDATED`: Обновлена стоимость заказа
- `ORDER_DEADLINE_CHANGED`: Изменены сроки выполнения
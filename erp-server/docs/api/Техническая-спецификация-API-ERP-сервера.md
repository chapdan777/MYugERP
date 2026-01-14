# Техническая спецификация API ERP-сервера

## Обзор
Этот документ предоставляет полную техническую спецификацию для взаимодействия фронтенда с бэкендом ERP-сервера MYugERP. Он охватывает API эндпоинты, аутентификацию, модели данных, обработку ошибок и паттерны интеграции для эффективной разработки фронтенд-приложений.

## 1. Документация API эндпоинтов

### Базовый URL
```
https://api.erp-system.com/v1
```

### Основные модули и эндпоинты

#### Модуль аутентификации (`/api/auth`)
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "строка",
  "password": "строка"
}

Ответ 200 OK:
{
  "accessToken": "строка_jwt_токена",
  "refreshToken": "строка_refresh_токена",
  "user": {
    "id": 1,
    "username": "ivanov",
    "role": "manager",
    "fullName": "Иванов И.И.",
    "email": "ivanov@example.com"
  }
}

POST /api/auth/refresh
Authorization: Bearer <refresh_token>
Content-Type: application/json

Ответ 200 OK:
{
  "accessToken": "новая_строка_jwt_токена",
  "refreshToken": "новая_строка_refresh_токена"
}

POST /api/auth/logout
Authorization: Bearer <access_token>

GET /api/auth/me
Authorization: Bearer <access_token>

Ответ 200 OK:
{
  "id": 1,
  "username": "ivanov",
  "role": "manager",
  "fullName": "Иванов И.И.",
  "email": "ivanov@example.com",
  "phone": "+79991234567",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### Модуль пользователей (`/api/users`)
```http
GET /api/users
Authorization: Bearer <access_token>
Параметры запроса:
- page: число (по умолчанию: 1)
- limit: число (по умолчанию: 20, максимум: 100)
- role: строка (опциональный фильтр)
- search: строка (опциональный поиск по имени/email)

Ответ 200 OK:
{
  "data": [
    {
      "id": 1,
      "username": "ivanov",
      "fullName": "Иванов И.И.",
      "email": "ivanov@example.com",
      "role": "manager",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}

POST /api/users
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "username": "novy_polzovatel",
  "password": "надежный_пароль",
  "fullName": "Новый Пользователь",
  "email": "novy@example.com",
  "role": "employee",
  "phone": "+79991234567"
}

Ответ 201 Created:
{
  "id": 123,
  "username": "novy_polzovatel",
  "fullName": "Новый Пользователь",
  "email": "novy@example.com",
  "role": "employee",
  "isActive": true,
  "createdAt": "2024-01-20T14:30:00Z"
}

GET /api/users/{id}
Authorization: Bearer <access_token>

PUT /api/users/{id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "fullName": "Обновленное Имя",
  "email": "obnovlenny@example.com",
  "role": "manager",
  "phone": "+79997654321"
}

DELETE /api/users/{id}
Authorization: Bearer <access_token>
```

#### Модуль продуктов (`/api/products`)
```http
GET /api/products
Authorization: Bearer <access_token>
Параметры запроса:
- page: число (по умолчанию: 1)
- limit: число (по умолчанию: 20)
- category: строка (опциональный фильтр)
- search: строка (опциональный поиск по названию/коду)

Ответ 200 OK:
{
  "data": [
    {
      "id": 1,
      "name": "Фасад кухонный",
      "code": "FK-001",
      "category": "фасад",
      "basePrice": 1500,
      "unit": "м2",
      "description": "Стандартный фасад кухонный",
      "isActive": true,
      "createdAt": "2024-01-10T09:15:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "pages": 8
  }
}

POST /api/products
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Новый Продукт",
  "code": "NP-001",
  "category": "фурнитура",
  "basePrice": 2500,
  "unit": "штука",
  "description": "Новый компонент фурнитуры"
}

GET /api/products/{id}
Authorization: Bearer <access_token>

PUT /api/products/{id}
Authorization: Bearer <access_token>

DELETE /api/products/{id}
Authorization: Bearer <access_token>
```

#### Модуль заказов (`/api/orders`)
```http
GET /api/orders
Authorization: Bearer <access_token>
Параметры запроса:
- page: число (по умолчанию: 1)
- limit: число (по умолчанию: 20)
- status: строка (DRAFT|CONFIRMED|PRODUCTION|SHIPPED|DELIVERED|COMPLETED|CANCELLED)
- clientId: число (опциональный фильтр)
- dateFrom: строка (дата в формате ISO 8601)
- dateTo: строка (дата в формате ISO 8601)

Ответ 200 OK:
{
  "data": [
    {
      "id": 1,
      "orderNumber": "ORD-2024-001",
      "clientId": 45,
      "clientName": "ООО МебельПрофи",
      "status": "CONFIRMED",
      "paymentStatus": "PARTIALLY_PAID",
      "totalAmount": 45000,
      "deadline": "2024-02-15T15:30:00Z",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 23,
    "pages": 2
  }
}

POST /api/orders
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "clientId": 45,
  "clientName": "ООО МебельПрофи",
  "deadline": "2024-02-15T15:30:00Z",
  "notes": "Срочный заказ на кухню"
}

GET /api/orders/{id}
Authorization: Bearer <access_token>

Ответ 200 OK:
{
  "id": 1,
  "orderNumber": "ORD-2024-001",
  "clientId": 45,
  "clientName": "ООО МебельПрофи",
  "status": "CONFIRMED",
  "paymentStatus": "PARTIALLY_PAID",
  "totalAmount": 45000,
  "deadline": "2024-02-15T15:30:00Z",
  "notes": "Срочный заказ на кухню",
  "sections": [
    {
      "id": 1,
      "sectionNumber": 1,
      "name": "Кухонные фасады",
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
            {"propertyId": 2, "propertyName": "Отделка", "value": "Натуральная"}
          ]
        }
      ]
    }
  ],
  "createdAt": "2024-01-15T10:00:00Z"
}

PATCH /api/orders/{id}/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "PRODUCTION",
  "notes": "Начало производственного процесса"
}
```

#### Модуль ценообразования (`/api/price-modifiers`)
```http
GET /api/price-modifiers
Authorization: Bearer <access_token>
Параметры запроса:
- page: число (по умолчанию: 1)
- limit: число (по умолчанию: 20)
- isActive: boolean (опциональный фильтр)
- modifierType: строка (PERCENTAGE|FIXED_AMOUNT|MULTIPLIER|FIXED_PRICE|PER_UNIT)

POST /api/price-modifiers/calculate
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "basePrice": 1500,
  "quantity": 2,
  "unit": 1.5,
  "coefficient": 1.2,
  "properties": [
    {"propertyId": 1, "propertyValue": "премиум"},
    {"propertyId": 2, "propertyValue": "опт"}
  ]
}

Ответ 200 OK:
{
  "basePrice": 1500,
  "unitPrice": 1800,
  "modifiedUnitPrice": 2700,
  "quantity": 2,
  "finalPrice": 5400,
  "modifiersApplied": [
    {
      "modifierId": 1,
      "name": "Надбавка за премиум материал",
      "code": "PREMIUM_MAT",
      "type": "PERCENTAGE",
      "value": 20,
      "appliedValue": 300
    }
  ]
}
```

## 2. Аутентификация и авторизация

### Поток аутентификации
1. **Вход в систему**: Фронтенд отправляет учетные данные на `/api/auth/login`
2. **Хранение токенов**: Сохранить JWT access token в localStorage/sessionStorage
3. **Обновление токенов**: Использовать refresh token для получения новых access token при истечении срока
4. **Выход из системы**: Вызвать `/api/auth/logout` для аннулирования токенов

### Заголовки авторизации
```http
Authorization: Bearer <jwt_access_token>
```

### Контроль доступа на основе ролей (RBAC)
Доступные роли:
- `admin` - Полный доступ к системе
- `manager` - Управление заказами, ценообразование, пользователи
- `employee` - Создание заказов, базовые операции
- `viewer` - Доступ только для чтения

### Защищенные маршруты
Все эндпоинты, кроме `/api/auth/login` и `/api/auth/refresh`, требуют аутентификации.

## 3. Модели данных и DTO схемы

### Обертка общего ответа
```typescript
interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

### Формат ответа об ошибке
```typescript
interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string | string[];
  details?: any;
  timestamp: string;
  path: string;
}

// Примеры ответов об ошибках:
// 400 Bad Request
{
  "statusCode": 400,
  "error": "BadRequestException",
  "message": "Ошибка валидации",
  "details": {
    "field": "email",
    "message": "Неверный формат email"
  },
  "timestamp": "2024-01-20T14:30:00Z",
  "path": "/api/users"
}

// 401 Unauthorized
{
  "statusCode": 401,
  "error": "UnauthorizedException",
  "message": "Неверный или истекший токен",
  "timestamp": "2024-01-20T14:30:00Z",
  "path": "/api/users"
}

// 403 Forbidden
{
  "statusCode": 403,
  "error": "ForbiddenException",
  "message": "Недостаточно прав доступа",
  "timestamp": "2024-01-20T14:30:00Z",
  "path": "/api/users"
}

// 404 Not Found
{
  "statusCode": 404,
  "error": "NotFoundException",
  "message": "Ресурс не найден",
  "timestamp": "2024-01-20T14:30:00Z",
  "path": "/api/users/999"
}

// 500 Internal Server Error
{
  "statusCode": 500,
  "error": "InternalServerError",
  "message": "Внутренняя ошибка сервера",
  "timestamp": "2024-01-20T14:30:00Z",
  "path": "/api/users"
}
```

### DTO пользователей
```typescript
interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: 'admin' | 'manager' | 'employee' | 'viewer';
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface CreateUserDto {
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: 'admin' | 'manager' | 'employee' | 'viewer';
  phone?: string;
}

interface UpdateUserDto {
  fullName?: string;
  email?: string;
  role?: 'admin' | 'manager' | 'employee' | 'viewer';
  phone?: string;
  isActive?: boolean;
}
```

### DTO продуктов
```typescript
interface Product {
  id: number;
  name: string;
  code: string;
  category: string;
  basePrice: number;
  unit: 'м2' | 'пог_метр' | 'штука' | 'комплект';
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface CreateProductDto {
  name: string;
  code: string;
  category: string;
  basePrice: number;
  unit: 'м2' | 'пог_метр' | 'штука' | 'комплект';
  description?: string;
}

interface UpdateProductDto {
  name?: string;
  code?: string;
  category?: string;
  basePrice?: number;
  unit?: 'м2' | 'пог_метр' | 'штука' | 'комплект';
  description?: string;
  isActive?: boolean;
}
```

### DTO заказов
```typescript
interface Order {
  id: number;
  orderNumber: string;
  clientId: number;
  clientName: string;
  status: 'DRAFT' | 'CONFIRMED' | 'PRODUCTION' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
  totalAmount: number;
  deadline: string;
  notes?: string;
  sections?: OrderSection[];
  createdAt: string;
  updatedAt?: string;
}

interface OrderSection {
  id: number;
  sectionNumber: number;
  name: string;
  description?: string;
  items?: OrderItem[];
}

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  properties: ItemProperty[];
}

interface ItemProperty {
  propertyId: number;
  propertyName: string;
  value: string;
}

interface CreateOrderDto {
  clientId: number;
  clientName: string;
  deadline: string;
  notes?: string;
}
```

## 4. Протоколы обработки ошибок

### HTTP коды статуса
- **200 OK**: Успешные запросы GET, PUT, PATCH
- **201 Created**: Успешные запросы POST
- **204 No Content**: Успешные запросы DELETE
- **400 Bad Request**: Ошибки валидации, неверные запросы
- **401 Unauthorized**: Отсутствующая или неверная аутентификация
- **403 Forbidden**: Недостаточно прав доступа
- **404 Not Found**: Ресурс не существует
- **409 Conflict**: Конфликт ресурсов (дубликат, неверное состояние)
- **422 Unprocessable Entity**: Нарушения бизнес-правил
- **429 Too Many Requests**: Превышение лимита запросов
- **500 Internal Server Error**: Непредвиденные ошибки сервера

### Обработка ошибок на стороне клиента
```javascript
// Общий обработчик ошибок
const handleApiError = (error) => {
  if (error.response) {
    // Сервер ответил кодом ошибки
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        // Перенаправить на страницу входа
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        break;
      case 403:
        // Показать сообщение о недостатке прав
        showMessage('Недостаточно прав доступа', 'error');
        break;
      case 400:
      case 422:
        // Показать ошибки валидации
        if (Array.isArray(data.message)) {
          data.message.forEach(msg => showMessage(msg, 'error'));
        } else {
          showMessage(data.message, 'error');
        }
        break;
      case 500:
        // Показать общую ошибку
        showMessage('Произошла ошибка сервера', 'error');
        break;
      default:
        showMessage(data.message || 'Произошла ошибка', 'error');
    }
  } else if (error.request) {
    // Ошибка сети
    showMessage('Ошибка сети - проверьте подключение', 'error');
  } else {
    // Другие ошибки
    showMessage('Произошла непредвиденная ошибка', 'error');
  }
};
```

## 5. Спецификации WebSocket соединений

### Обновления в реальном времени
WebSocket эндпоинт: `wss://api.erp-system.com/ws`

### Настройка соединения
```javascript
const socket = new WebSocket('wss://api.erp-system.com/ws');

socket.onopen = () => {
  // Аутентификация после подключения
  socket.send(JSON.stringify({
    type: 'AUTHENTICATE',
    token: localStorage.getItem('accessToken')
  }));
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'ORDER_STATUS_CHANGED':
      // Обработка обновлений статуса заказов
      updateOrderStatus(data.payload);
      break;
    case 'PAYMENT_RECEIVED':
      // Обработка уведомлений о платежах
      showPaymentNotification(data.payload);
      break;
    case 'SYSTEM_NOTIFICATION':
      // Обработка общих уведомлений
      showNotification(data.payload);
      break;
  }
};

socket.onerror = (error) => {
  console.error('Ошибка WebSocket:', error);
};

socket.onclose = (event) => {
  if (event.code !== 1000) {
    // Переподключение с экспоненциальной задержкой
    setTimeout(() => reconnectWebSocket(), 1000);
  }
};
```

### События подписки
```javascript
// Подписка на обновления заказов
socket.send(JSON.stringify({
  type: 'SUBSCRIBE_ORDER_UPDATES',
  orderId: 123
}));

// Подписка на уведомления о платежах
socket.send(JSON.stringify({
  type: 'SUBSCRIBE_PAYMENT_NOTIFICATIONS',
  clientId: 45
}));

// Подписка на системные уведомления
socket.send(JSON.stringify({
  type: 'SUBSCRIBE_SYSTEM_NOTIFICATIONS'
}));
```

## 6. Процедуры загрузки/скачивания файлов

### Загрузка файлов
```http
POST /api/files/upload
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

Form Data:
- file: (бинарный файл)
- category: строка (document|image|attachment)
- referenceId: число (опционально, для связи с сущностями)

Ответ 201 Created:
{
  "id": 1,
  "filename": "contract.pdf",
  "originalName": "Договор_Документ.pdf",
  "size": 1024000,
  "mimeType": "application/pdf",
  "category": "document",
  "url": "https://cdn.erp-system.com/files/contract.pdf",
  "uploadedAt": "2024-01-20T14:30:00Z"
}
```

### Скачивание файлов
```http
GET /api/files/{id}/download
Authorization: Bearer <access_token>

Ответ 200 OK:
Content-Type: application/pdf
Content-Disposition: attachment; filename="contract.pdf"

[бинарное содержимое файла]
```

### Управление файлами
```http
GET /api/files
Authorization: Bearer <access_token>
Параметры запроса:
- category: строка (опциональный фильтр)
- referenceId: число (опциональный фильтр)
- page: число (по умолчанию: 1)
- limit: число (по умолчанию: 20)

DELETE /api/files/{id}
Authorization: Bearer <access_token>
```

## 7. Стандарты пагинации и фильтрации

### Параметры пагинации запроса
Все эндпоинты списка поддерживают:
- `page`: Номер страницы (начиная с 1, по умолчанию: 1)
- `limit`: Элементов на странице (по умолчанию: 20, максимум: 100)
- `sort`: Поле сортировки (например, "createdAt", "-name" для убывающей)
- `search`: Текстовый поиск по соответствующим полям

### Параметры фильтрации
Общие фильтры по модулям:
- **Пользователи**: role, isActive, search (имя/email)
- **Продукты**: category, isActive, search (название/код)
- **Заказы**: status, paymentStatus, clientId, диапазон дат
- **Платежи**: clientId, диапазон дат, paymentMethod

### Формат ответа пагинации
```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;        // Текущая страница
    limit: number;       // Элементов на странице
    total: number;       // Общее количество элементов
    pages: number;       // Общее количество страниц
    hasNext: boolean;    // Есть следующая страница
    hasPrev: boolean;    // Есть предыдущая страница
  };
}
```

### Пример реализации
```javascript
// Получение пагинированных заказов
const fetchOrders = async (page = 1, limit = 20, filters = {}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...filters
  });
  
  const response = await api.get(`/orders?${params}`);
  return response.data;
};

// Использование
const orders = await fetchOrders(1, 20, {
  status: 'CONFIRMED',
  clientId: '45'
});
```

## 8. Стратегии ограничения скорости и кэширования

### Ограничение скорости
- **Анонимные запросы**: 100 запросов/час
- **Аутентифицированные запросы**: 1000 запросов/час
- **Критические эндпоинты**: 100 запросов/час (вход, сброс пароля)

### Заголовки ответа
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1642687200
Retry-After: 3600
```

### Заголовки кэширования
```http
Cache-Control: max-age=300, must-revalidate
ETag: "abc123def456"
Last-Modified: Wed, 21 Jan 2024 12:00:00 GMT
```

### Реализация клиентского кэширования
```javascript
// Конфигурация кэша
const cacheConfig = {
  ttl: 5 * 60 * 1000, // 5 минут
  maxSize: 100
};

// Кэшированный API клиент
class CachedApiClient {
  constructor() {
    this.cache = new Map();
  }
  
  async get(url, useCache = true) {
    const cacheKey = `${url}`;
    
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < cacheConfig.ttl) {
        return cached.data;
      }
    }
    
    const response = await axios.get(url);
    
    // Кэширование успешных ответов
    if (response.status === 200) {
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      
      // Очистка старых записей
      if (this.cache.size > cacheConfig.maxSize) {
        const oldestKey = this.cache.keys().next().value;
        this.cache.delete(oldestKey);
      }
    }
    
    return response.data;
  }
}
```

## 9. Заголовки безопасности и конфигурация CORS

### Заголовки безопасности
API автоматически включает эти заголовки безопасности:

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

### Конфигурация CORS
```typescript
// Разрешенные источники
const corsOptions = {
  origin: [
    'https://erp.mycompany.com',
    'https://admin.erp.mycompany.com',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
```

### Реализация на стороне клиента
```javascript
// Конфигурация Axios с учетом безопасности
const api = axios.create({
  baseURL: 'https://api.erp-system.com/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Для cookie-аутентификации при необходимости
});

// Интерцептор запросов для токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцептор ответов для обновления токена
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/auth/refresh', {
          refreshToken
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Перенаправить на страницу входа
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

## 10. Стратегия версионирования

### Версионирование API
Версия включается в путь URL:
```
https://api.erp-system.com/v1/endpoint
https://api.erp-system.com/v2/endpoint  (будущие версии)
```

### Совместимость версий
- **v1**: Текущая стабильная версия
- Критические изменения требуют новой версии
- Старые версии поддерживаются 12 месяцев после объявления устаревшими
- Предупреждения об устаревании отправляются за 3 месяца

### Пример эволюции эндпоинтов
```typescript
// v1 - Текущая реализация
GET /api/v1/orders/{id}

// v2 - Будущее расширение с дополнительными полями
GET /api/v2/orders/{id}
// Возвращает дополнительные поля: estimatedCompletionDate, productionProgress
```

### Управление версиями на стороне клиента
```javascript
// Конфигурация версии API
const API_CONFIG = {
  version: 'v1',
  baseUrl: 'https://api.erp-system.com'
};

const api = axios.create({
  baseURL: `${API_CONFIG.baseUrl}/${API_CONFIG.version}`
});

// Обработка ошибок версий
const handleVersionError = (error) => {
  if (error.response?.status === 410) {
    // Версия API устарела
    showMessage('Пожалуйста, обновите ваше приложение', 'warning');
    // Запустить обновление приложения или перенаправить на новую версию
  }
};
```

## Рекомендации по реализации

### Лучшие практики для интеграции фронтенда

1. **Управление состоянием**: Использовать Redux/Context для общего состояния API
2. **Состояния загрузки**: Реализовать соответствующие индикаторы загрузки
3. **Границы ошибок**: Обернуть компоненты в границы ошибок
4. **Оптимистичные обновления**: Для лучшего UX при мутациях
5. **Дедупликация запросов**: Предотвратить дублирующиеся одновременные запросы
6. **Поддержка офлайн**: Кэшировать критические данные для офлайн-доступа

### Пример компонента интеграции
```typescript
import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

interface OrderListProps {
  clientId?: number;
  status?: string;
}

const OrderList: React.FC<OrderListProps> = ({ clientId, status }) => {
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const api = useApi();
  
  useEffect(() => {
    fetchOrders();
  }, [page, clientId, status]);
  
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filters: Record<string, any> = {
        page,
        limit: 20
      };
      
      if (clientId) filters.clientId = clientId;
      if (status) filters.status = status;
      
      const response = await api.get('/orders', { params: filters });
      setOrders(response.data);
    } catch (err: any) {
      setError(err.message || 'Не удалось получить заказы');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  
  return (
    <div>
      <h2>Заказы</h2>
      {orders.map(order => (
        <div key={order.id}>
          <h3>{order.orderNumber}</h3>
          <p>Статус: {order.status}</p>
          <p>Сумма: {order.totalAmount}</p>
        </div>
      ))}
      
      <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
        Назад
      </button>
      <button onClick={() => setPage(p => p + 1)}>
        Вперед
      </button>
    </div>
  );
};

export default OrderList;
```

Эта спецификация предоставляет полную основу для фронтенд-разработчиков для создания надежных, безопасных и производительных приложений, которые интегрируются бесшовно с бэкендом ERP-сервера.
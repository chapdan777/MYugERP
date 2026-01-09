# Руководство по тестированию модулей ERP-сервера

## 📋 Оглавление

1. [Подготовка к тестированию](#подготовка-к-тестированию)
2. [Проверка базовой инфраструктуры](#проверка-базовой-инфраструктуры)
3. [Тестирование модулей](#тестирование-модулей)
4. [Автоматизированное тестирование](#автоматизированное-тестирование)
5. [Интеграционное тестирование](#интеграционное-тестирование)
6. [Чек-лист проверки](#чек-лист-проверки)

---

## Подготовка к тестированию

### 1. Проверка окружения

```bash
# Перейти в директорию проекта
cd /Users/mironocean/Documents/Progs/MYugERP/erp-server

# Проверить версии
node --version    # Должно быть >= 18.x
npm --version     # Должно быть >= 8.x
psql --version    # Проверить PostgreSQL
```

### 2. Установка зависимостей

```bash
# Установить зависимости
npm install --legacy-peer-deps

# Проверить TypeScript компиляцию
npm run build
```

### 3. Настройка базы данных

```bash
# Создать базу данных (если еще не создана)
createdb erp_production

# Или через psql
psql -U postgres
CREATE DATABASE erp_production;
\q

# Запустить миграции
npm run migration:run

# Заполнить начальными данными
npm run seed
```

---

## Проверка базовой инфраструктуры

### Шаг 1: Проверка подключения к БД

Создайте тестовый скрипт `test-db-connection.js`:

```bash
cat > test-db-connection.js << 'EOF'
require('dotenv').config();
const { DataSource } = require('typeorm');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

AppDataSource.initialize()
  .then(() => {
    console.log('✅ Подключение к БД успешно!');
    return AppDataSource.query('SELECT NOW()');
  })
  .then(result => {
    console.log('⏰ Время БД:', result[0].now);
    return AppDataSource.destroy();
  })
  .catch(error => {
    console.error('❌ Ошибка подключения:', error.message);
    process.exit(1);
  });
EOF

node test-db-connection.js
```

### Шаг 2: Запуск сервера в режиме разработки

```bash
# Запустить сервер
npm run start:dev

# В другом терминале проверить здоровье
curl http://localhost:3000

# Ожидаемый ответ: "Hello World!" или подобный
```

### Шаг 3: Проверка Swagger документации

Откройте в браузере:
```
http://localhost:3000/api/docs
```

Должна отобразиться интерактивная документация API.

---

## Тестирование модулей

### 🔐 Модуль 1: Authentication (Auth)

#### Endpoints для тестирования:

**1. POST /auth/login - Вход в систему**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

Ожидаемый ответ:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

**2. GET /auth/me - Проверка токена**

```bash
# Сохраните accessToken из предыдущего запроса
ACCESS_TOKEN="ваш_токен_здесь"

curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**3. POST /auth/refresh - Обновление токена**

```bash
# Используйте refreshToken из login
REFRESH_TOKEN="ваш_refresh_токен_здесь"

curl -X POST http://localhost:3000/auth/refresh \
  -H "Authorization: Bearer $REFRESH_TOKEN"
```

**4. POST /auth/logout - Выход**

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

#### ✅ Чек-лист Auth модуля:
- [ ] Login возвращает токены
- [ ] Access token работает для защищенных endpoints
- [ ] Refresh token обновляет access token
- [ ] Неверные credentials возвращают 401
- [ ] Невалидный токен возвращает 401
- [ ] /auth/me возвращает информацию о пользователе

---

### 👤 Модуль 2: Users (Пользователи)

**1. GET /users - Получить список пользователей**

```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**2. GET /users/:id - Получить пользователя по ID**

```bash
curl -X GET http://localhost:3000/users/1 \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**3. POST /users - Создать пользователя**

```bash
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "test123",
    "fullName": "Test User",
    "email": "test@example.com",
    "role": "manager"
  }'
```

**4. PATCH /users/:id - Обновить пользователя**

```bash
curl -X PATCH http://localhost:3000/users/2 \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Updated Name"
  }'
```

**5. DELETE /users/:id - Удалить пользователя**

```bash
curl -X DELETE http://localhost:3000/users/2 \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

#### ✅ Чек-лист Users модуля:
- [ ] Получение списка пользователей работает
- [ ] Создание нового пользователя работает
- [ ] Пароль хешируется (не хранится в открытом виде)
- [ ] Обновление данных работает
- [ ] Валидация email работает
- [ ] RBAC: только admin может управлять пользователями

---

### 📦 Модуль 3: Products (Номенклатура)

**1. GET /products - Список продуктов**

```bash
curl -X GET http://localhost:3000/products \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**2. POST /products - Создать продукт**

```bash
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Фасад белый",
    "category": "facades",
    "unit": "m2",
    "basePrice": 1500.00,
    "defaultLength": 600,
    "defaultWidth": 400
  }'
```

**3. GET /products/:id - Получить продукт**

```bash
curl -X GET http://localhost:3000/products/1 \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**4. PATCH /products/:id - Обновить продукт**

```bash
curl -X PATCH http://localhost:3000/products/1 \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "basePrice": 1600.00
  }'
```

#### ✅ Чек-лист Products модуля:
- [ ] CRUD операции работают
- [ ] Валидация полей работает (цена > 0)
- [ ] Единицы измерения корректны (m², п.м., шт.)
- [ ] Размеры по умолчанию сохраняются

---

### 🏷️ Модуль 4: Properties (Свойства)

**1. GET /properties - Список свойств**

```bash
curl -X GET http://localhost:3000/properties \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**2. POST /properties - Создать свойство**

```bash
curl -X POST http://localhost:3000/properties \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Цвет",
    "type": "select",
    "possibleValues": ["Белый", "Черный", "Серый"]
  }'
```

**3. GET /property-dependencies - Зависимости свойств**

```bash
curl -X GET http://localhost:3000/property-dependencies \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**4. POST /property-dependencies - Создать зависимость**

```bash
curl -X POST http://localhost:3000/property-dependencies \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourcePropertyId": "uuid-свойства-1",
    "sourceValue": "МДФ",
    "targetPropertyId": "uuid-свойства-2",
    "targetValue": "Покраска обязательна"
  }'
```

#### ✅ Чек-лист Properties модуля:
- [ ] Создание свойств разных типов
- [ ] Зависимости работают корректно
- [ ] Возможные значения сохраняются

---

### 💰 Модуль 5: Pricing (Ценообразование)

**1. GET /price-modifiers - Список модификаторов**

```bash
curl -X GET http://localhost:3000/price-modifiers \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**2. POST /price-modifiers - Создать модификатор**

```bash
curl -X POST http://localhost:3000/price-modifiers \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "uuid-продукта",
    "propertyId": "uuid-свойства",
    "propertyValue": "Белый глянец",
    "priceChange": 200.00,
    "changeType": "absolute"
  }'
```

**3. POST /pricing/calculate - Расчет цены**

```bash
curl -X POST http://localhost:3000/pricing/calculate \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "uuid-продукта",
    "selectedProperties": {
      "цвет": "Белый глянец",
      "материал": "МДФ"
    },
    "length": 600,
    "width": 400,
    "quantity": 10
  }'
```

#### ✅ Чек-лист Pricing модуля:
- [ ] Модификаторы применяются корректно
- [ ] Расчет с процентами работает
- [ ] Расчет с абсолютными значениями работает
- [ ] Множественные модификаторы суммируются

---

### ⚙️ Модуль 6: Configuration (Шаблоны заказов)

**1. GET /order-templates - Список шаблонов**

```bash
curl -X GET http://localhost:3000/order-templates \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**2. POST /order-templates - Создать шаблон**

```bash
curl -X POST http://localhost:3000/order-templates \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderType": "client",
    "name": "Стандартный клиентский заказ"
  }'
```

**3. GET /section-templates - Шаблоны шапок**

```bash
curl -X GET http://localhost:3000/section-templates \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

#### ✅ Чек-лист Configuration модуля:
- [ ] Шаблоны заказов создаются
- [ ] Шаблоны шапок работают
- [ ] Связь свойств с шаблонами корректна

---

### 📊 Модуль 7: Audit (Аудит)

**1. GET /audit-logs - Журнал аудита**

```bash
curl -X GET "http://localhost:3000/audit-logs?limit=50" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**2. GET /audit-logs/entity/:entityType/:entityId - Аудит сущности**

```bash
curl -X GET "http://localhost:3000/audit-logs/entity/Order/uuid-заказа" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**3. GET /audit-logs/user/:userId - Действия пользователя**

```bash
curl -X GET "http://localhost:3000/audit-logs/user/1" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

#### ✅ Чек-лист Audit модуля:
- [ ] Все действия логируются
- [ ] Изменения сущностей записываются
- [ ] Старые и новые значения сохраняются
- [ ] Фильтрация по пользователю работает
- [ ] Фильтрация по типу сущности работает

---

## Автоматизированное тестирование

### Создание тестового скрипта

Создайте файл `test-all-modules.sh`:

```bash
cat > test-all-modules.sh << 'EOF'
#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"
ACCESS_TOKEN=""

echo -e "${YELLOW}=== Тестирование модулей ERP-сервера ===${NC}\n"

# 1. Проверка сервера
echo -e "${YELLOW}1. Проверка доступности сервера...${NC}"
if curl -s -o /dev/null -w "%{http_code}" $BASE_URL | grep -q "200"; then
  echo -e "${GREEN}✅ Сервер доступен${NC}\n"
else
  echo -e "${RED}❌ Сервер недоступен${NC}\n"
  exit 1
fi

# 2. Тест аутентификации
echo -e "${YELLOW}2. Тест модуля Auth...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ACCESS_TOKEN" ]; then
  echo -e "${GREEN}✅ Login успешен${NC}"
  echo -e "   Access Token: ${ACCESS_TOKEN:0:30}..."
else
  echo -e "${RED}❌ Login не удался${NC}"
  echo "   Response: $LOGIN_RESPONSE"
fi

# 3. Тест /auth/me
ME_RESPONSE=$(curl -s -X GET $BASE_URL/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo $ME_RESPONSE | grep -q "username"; then
  echo -e "${GREEN}✅ /auth/me работает${NC}\n"
else
  echo -e "${RED}❌ /auth/me не работает${NC}\n"
fi

# 4. Тест Users модуля
echo -e "${YELLOW}3. Тест модуля Users...${NC}"
USERS_RESPONSE=$(curl -s -X GET $BASE_URL/users \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo $USERS_RESPONSE | grep -q "id"; then
  echo -e "${GREEN}✅ GET /users работает${NC}\n"
else
  echo -e "${YELLOW}⚠️  GET /users вернул: $USERS_RESPONSE${NC}\n"
fi

# 5. Тест Products модуля
echo -e "${YELLOW}4. Тест модуля Products...${NC}"
PRODUCTS_RESPONSE=$(curl -s -X GET $BASE_URL/products \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo $PRODUCTS_RESPONSE | grep -q "\[" || echo $PRODUCTS_RESPONSE | grep -q "id"; then
  echo -e "${GREEN}✅ GET /products работает${NC}\n"
else
  echo -e "${YELLOW}⚠️  GET /products вернул: ${PRODUCTS_RESPONSE:0:100}${NC}\n"
fi

# 6. Тест Properties модуля
echo -e "${YELLOW}5. Тест модуля Properties...${NC}"
PROPERTIES_RESPONSE=$(curl -s -X GET $BASE_URL/properties \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo $PROPERTIES_RESPONSE | grep -q "\[" || echo $PROPERTIES_RESPONSE | grep -q "id"; then
  echo -e "${GREEN}✅ GET /properties работает${NC}\n"
else
  echo -e "${YELLOW}⚠️  GET /properties вернул: ${PROPERTIES_RESPONSE:0:100}${NC}\n"
fi

# 7. Тест Audit модуля
echo -e "${YELLOW}6. Тест модуля Audit...${NC}"
AUDIT_RESPONSE=$(curl -s -X GET "$BASE_URL/audit-logs?limit=10" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo $AUDIT_RESPONSE | grep -q "\[" || echo $AUDIT_RESPONSE | grep -q "id"; then
  echo -e "${GREEN}✅ GET /audit-logs работает${NC}\n"
else
  echo -e "${YELLOW}⚠️  GET /audit-logs вернул: ${AUDIT_RESPONSE:0:100}${NC}\n"
fi

echo -e "${GREEN}=== Тестирование завершено ===${NC}"
EOF

chmod +x test-all-modules.sh
./test-all-modules.sh
```

### Запуск юнит-тестов

```bash
# Запустить все тесты
npm run test

# Запустить с покрытием
npm run test:cov

# Запустить в watch режиме
npm run test:watch

# E2E тесты
npm run test:e2e
```

---

## Интеграционное тестирование

### Создание E2E теста для полного цикла заказа

Создайте файл `test/order-workflow.e2e-spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Order Workflow (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Получить токен
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin123' })
      .expect(200);

    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. Создать продукт', () => {
    return request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Test Product',
        category: 'facades',
        unit: 'm2',
        basePrice: 1000,
      })
      .expect(201);
  });

  it('2. Создать свойство', () => {
    return request(app.getHttpServer())
      .post('/properties')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Test Property',
        type: 'select',
        possibleValues: ['Value1', 'Value2'],
      })
      .expect(201);
  });

  // Добавьте больше тестов для полного workflow
});
```

Запустить:
```bash
npm run test:e2e
```

---

## Чек-лист проверки

### Инфраструктура
- [ ] База данных подключена
- [ ] Миграции выполнены
- [ ] Seed данные загружены
- [ ] Сервер запускается без ошибок
- [ ] Swagger UI доступен
- [ ] TypeScript компилируется без ошибок
- [ ] Линтер не показывает критичных ошибок

### Модули - Базовые функции
- [ ] Auth: Login работает
- [ ] Auth: Token validation работает
- [ ] Auth: Refresh работает
- [ ] Users: CRUD операции работают
- [ ] Products: CRUD операции работают
- [ ] Properties: CRUD операции работают
- [ ] Pricing: Расчет цены работает
- [ ] Configuration: Шаблоны работают
- [ ] Audit: Логирование работает

### Безопасность
- [ ] Защищенные endpoints требуют токен
- [ ] Невалидный токен возвращает 401
- [ ] RBAC работает корректно
- [ ] Пароли хешируются
- [ ] Refresh token защищен

### Валидация
- [ ] Валидация входных DTO работает
- [ ] Некорректные данные возвращают 400
- [ ] Обязательные поля проверяются
- [ ] Типы данных валидируются

### База данных
- [ ] Транзакции работают
- [ ] Foreign keys корректны
- [ ] Cascade удаление настроено
- [ ] Индексы созданы
- [ ] Миграции обратимы (revert работает)

### Производительность
- [ ] Список сущностей поддерживает пагинацию
- [ ] N+1 проблема отсутствует
- [ ] Запросы оптимизированы
- [ ] Ненужные JOIN отсутствуют

---

## Следующие шаги

### После успешного тестирования базовых модулей:

1. **Реализовать модуль Orders** (Заказы)
   - Создание заказа
   - Добавление позиций
   - Управление шапками
   - Расчет стоимости

2. **Реализовать модуль Production** (Производство)
   - Производственные участки
   - Технологические маршруты
   - Операции

3. **Реализовать модуль Work Orders** (Заказ-наряды)
   - Формирование заказ-нарядов
   - Канбан-доски
   - Контроль приоритетов

4. **Реализовать модуль Workforce** (Трудовые ресурсы)
   - Назначение работников
   - Расчет зарплаты
   - Квалификации

5. **Реализовать модуль Accounting** (Бухгалтерия)
   - Регистрация платежей
   - Баланс клиентов
   - Распределение оплат

---

## Полезные команды

```bash
# Просмотр логов в реальном времени
npm run start:dev 2>&1 | tee server.log

# Проверка структуры БД
psql -U postgres -d erp_production -c "\dt"

# Экспорт схемы БД
pg_dump -U postgres -d erp_production --schema-only > schema.sql

# Очистка и пересоздание БД
dropdb erp_production && createdb erp_production
npm run migration:run
npm run seed

# Откат последней миграции
npm run migration:revert

# Проверка TypeScript ошибок
npx tsc --noEmit

# Проверка линтером
npm run lint
```

---

## Решение проблем

### Сервер не запускается
```bash
# Проверить порт
lsof -i :3000

# Убить процесс, если занят
kill -9 <PID>
```

### Ошибка подключения к БД
```bash
# Проверить статус PostgreSQL
pg_isready -U postgres

# Запустить PostgreSQL (macOS)
brew services start postgresql@14
```

### Миграции не применяются
```bash
# Проверить таблицу миграций
psql -U postgres -d erp_production -c "SELECT * FROM migrations"

# Удалить запись о неудачной миграции
psql -U postgres -d erp_production -c "DELETE FROM migrations WHERE name = '...'"
```

---

**Автор:** Документация для проекта MYugERP  
**Дата:** Январь 2026  
**Версия:** 1.0

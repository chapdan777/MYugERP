#!/bin/bash

# Скрипт автоматизированного тестирования API ERP-сервера
# Использование: ./test-api.sh

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000/api"
ACCESS_TOKEN=""
REFRESH_TOKEN=""
TEST_USER_ID=""
TEST_PRODUCT_ID=""
TEST_PROPERTY_ID=""

# Счетчики
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Автоматическое тестирование ERP-сервера API           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

# Функция для вывода результата теста
test_result() {
  local test_name="$1"
  local response="$2"
  local expected="$3"
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  
  if echo "$response" | grep -q "$expected"; then
    echo -e "${GREEN}✅ PASS${NC} - $test_name"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    return 0
  else
    echo -e "${RED}❌ FAIL${NC} - $test_name"
    echo -e "   ${YELLOW}Response:${NC} ${response:0:200}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    return 1
  fi
}

# Проверка доступности сервера
echo -e "${YELLOW}[1/8] Проверка доступности сервера...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
  echo -e "${GREEN}✅ Сервер доступен (HTTP $HTTP_CODE)${NC}\n"
else
  echo -e "${RED}❌ Сервер недоступен (HTTP $HTTP_CODE)${NC}"
  echo -e "${YELLOW}Запустите сервер: npm run start:dev${NC}\n"
  exit 1
fi

# ==================== AUTH MODULE ====================
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║ [2/8] Тестирование модуля AUTH                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

# Test 1: Login
echo -e "\n${YELLOW}Test 1: POST /auth/login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

test_result "Login с корректными данными" "$LOGIN_RESPONSE" "accessToken"

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ACCESS_TOKEN" ]; then
  echo -e "   ${GREEN}Access Token получен:${NC} ${ACCESS_TOKEN:0:40}..."
fi

# Test 2: Login с неверными данными
echo -e "\n${YELLOW}Test 2: POST /auth/login (неверные данные)${NC}"
LOGIN_FAIL=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"wrong","password":"wrong"}')

test_result "Login с неверными данными возвращает ошибку" "$LOGIN_FAIL" "401\|400\|error"

# Test 3: Get current user
echo -e "\n${YELLOW}Test 3: GET /auth/me${NC}"
ME_RESPONSE=$(curl -s -X GET $BASE_URL/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN")

test_result "Получение текущего пользователя" "$ME_RESPONSE" "username"

# Test 4: Access без токена
echo -e "\n${YELLOW}Test 4: GET /auth/me (без токена)${NC}"
ME_NO_TOKEN=$(curl -s -X GET $BASE_URL/auth/me)

test_result "Доступ без токена возвращает ошибку" "$ME_NO_TOKEN" "401\|Unauthorized"

# Test 5: Refresh token
echo -e "\n${YELLOW}Test 5: POST /auth/refresh${NC}"
REFRESH_RESPONSE=$(curl -s -X POST $BASE_URL/auth/refresh \
  -H "Authorization: Bearer $REFRESH_TOKEN")

test_result "Обновление access токена" "$REFRESH_RESPONSE" "accessToken"

# ==================== USERS MODULE ====================
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║ [3/8] Тестирование модуля USERS                           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

# Test 6: Get all users
echo -e "\n${YELLOW}Test 6: GET /users${NC}"
USERS_RESPONSE=$(curl -s -X GET $BASE_URL/users \
  -H "Authorization: Bearer $ACCESS_TOKEN")

test_result "Получение списка пользователей" "$USERS_RESPONSE" "id\|\[\]"

# Test 7: Create user
echo -e "\n${YELLOW}Test 7: POST /users${NC}"
CREATE_USER=$(curl -s -X POST $BASE_URL/users \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser_'$(date +%s)'",
    "password": "test123456",
    "fullName": "Test User",
    "email": "test'$(date +%s)'@example.com",
    "role": "manager"
  }')

test_result "Создание нового пользователя" "$CREATE_USER" "id\|username"

TEST_USER_ID=$(echo $CREATE_USER | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1)
if [ -z "$TEST_USER_ID" ]; then
  TEST_USER_ID=$(echo $CREATE_USER | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
fi

# Test 8: Get user by ID
if [ -n "$TEST_USER_ID" ]; then
  echo -e "\n${YELLOW}Test 8: GET /users/$TEST_USER_ID${NC}"
  USER_BY_ID=$(curl -s -X GET $BASE_URL/users/$TEST_USER_ID \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  test_result "Получение пользователя по ID" "$USER_BY_ID" "id"
else
  echo -e "\n${YELLOW}Test 8: SKIP - User ID не получен${NC}"
fi

# ==================== PRODUCTS MODULE ====================
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║ [4/8] Тестирование модуля PRODUCTS                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

# Test 9: Get all products
echo -e "\n${YELLOW}Test 9: GET /products${NC}"
PRODUCTS_RESPONSE=$(curl -s -X GET $BASE_URL/products \
  -H "Authorization: Bearer $ACCESS_TOKEN")

test_result "Получение списка продуктов" "$PRODUCTS_RESPONSE" "id\|\[\]"

# Test 10: Create product
echo -e "\n${YELLOW}Test 10: POST /products${NC}"
CREATE_PRODUCT=$(curl -s -X POST $BASE_URL/products \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product '$(date +%s)'",
    "category": "facades",
    "unit": "m2",
    "basePrice": 1500.00,
    "defaultLength": 600,
    "defaultWidth": 400
  }')

test_result "Создание нового продукта" "$CREATE_PRODUCT" "id\|name"

TEST_PRODUCT_ID=$(echo $CREATE_PRODUCT | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1)

# Test 11: Get product by ID
if [ -n "$TEST_PRODUCT_ID" ]; then
  echo -e "\n${YELLOW}Test 11: GET /products/$TEST_PRODUCT_ID${NC}"
  PRODUCT_BY_ID=$(curl -s -X GET $BASE_URL/products/$TEST_PRODUCT_ID \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  test_result "Получение продукта по ID" "$PRODUCT_BY_ID" "id"
else
  echo -e "\n${YELLOW}Test 11: SKIP - Product ID не получен${NC}"
fi

# ==================== PROPERTIES MODULE ====================
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║ [5/8] Тестирование модуля PROPERTIES                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

# Test 12: Get all properties
echo -e "\n${YELLOW}Test 12: GET /properties${NC}"
PROPERTIES_RESPONSE=$(curl -s -X GET $BASE_URL/properties \
  -H "Authorization: Bearer $ACCESS_TOKEN")

test_result "Получение списка свойств" "$PROPERTIES_RESPONSE" "id\|\[\]"

# Test 13: Create property
echo -e "\n${YELLOW}Test 13: POST /properties${NC}"
CREATE_PROPERTY=$(curl -s -X POST $BASE_URL/properties \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Property '$(date +%s)'",
    "code": "test_prop_'$(date +%s)'",
    "dataType": "select",
    "isRequired": false,
    "displayOrder": 1,
    "possibleValues": ["Value1", "Value2", "Value3"]
  }')

test_result "Создание нового свойства" "$CREATE_PROPERTY" "id\|name"

TEST_PROPERTY_ID=$(echo $CREATE_PROPERTY | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1)

# ==================== PRICING MODULE ====================
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║ [6/8] Тестирование модуля PRICING                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

# Test 14: Get price modifiers
echo -e "\n${YELLOW}Test 14: GET /price-modifiers${NC}"
MODIFIERS_RESPONSE=$(curl -s -X GET $BASE_URL/price-modifiers \
  -H "Authorization: Bearer $ACCESS_TOKEN")

test_result "Получение модификаторов цен" "$MODIFIERS_RESPONSE" "id\|\[\]"

# ==================== CONFIGURATION MODULE ====================
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║ [7/8] Тестирование модуля CONFIGURATION                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

# Test 15: Get order templates
echo -e "\n${YELLOW}Test 15: GET /order-templates${NC}"
TEMPLATES_RESPONSE=$(curl -s -X GET $BASE_URL/order-templates \
  -H "Authorization: Bearer $ACCESS_TOKEN")

test_result "Получение шаблонов заказов" "$TEMPLATES_RESPONSE" "id\|\[\]"

# ==================== AUDIT MODULE ====================
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║ [8/8] Тестирование модуля AUDIT                           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

# Test 16: Get audit logs
echo -e "\n${YELLOW}Test 16: GET /audit-logs${NC}"
AUDIT_RESPONSE=$(curl -s -X GET "$BASE_URL/audit-logs?limit=10" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

test_result "Получение журнала аудита" "$AUDIT_RESPONSE" "id\|\[\]"

# ==================== SUMMARY ====================
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    ИТОГОВЫЙ ОТЧЕТ                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "Всего тестов:      ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Успешных:          ${GREEN}$PASSED_TESTS${NC}"
echo -e "Неудачных:         ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
  echo -e "\n${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║          ✅ ВСЕ ТЕСТЫ ПРОШЛИ УСПЕШНО! ✅                   ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}\n"
  exit 0
else
  echo -e "\n${RED}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║       ⚠️  ЕСТЬ НЕУДАЧНЫЕ ТЕСТЫ - ТРЕБУЕТСЯ ПРОВЕРКА       ║${NC}"
  echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}\n"
  exit 1
fi

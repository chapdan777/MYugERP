# Модуль ценообразования (Pricing Module)

## Обзор

Модуль ценообразования отвечает за управление ценами продукции и расчет стоимости заказов с учетом различных модификаторов и условий.

## Основные возможности

### 1. Управление модификаторами цен
- Создание, редактирование и удаление модификаторов цен
- Поддержка различных типов модификаторов (процентные, абсолютные, множители)
- Гибкая система условий применения

### 2. Расчет цен
- Автоматический расчет цен на основе базовой стоимости и модификаторов
- Поддержка различных единиц измерения (м², п.м., шт.)
- Учет коэффициентов и количества
- **unitPrice** - цена за единицу измерения (м²/п.м./шт) после применения всех модификаторов
- **modifiedUnitPrice** - итоговая цена с учетом размеров/геометрии (площадь, длина и т.д.)

### 3. Система условий фильтрации

#### Простые условия (устаревшие)
```json
{
  "propertyId": 123,
  "propertyValue": "премиум"
}
```

#### Сложные условия (рекомендуемые)
```json
{
  "conditionExpression": "propertyValue > 3000 AND propertyValue LIKE 'цвет:%'"
}
```

Подробная документация по синтаксису условий: [condition-syntax.md](documentation/condition-syntax.md)

## API Endpoints

### Модификаторы цен

#### Создание модификатора
```
POST /price-modifiers
```

#### Получение списка модификаторов
```
GET /price-modifiers
```

#### Получение модификатора по ID
```
GET /price-modifiers/:id
```

#### Обновление модификатора
```
PUT /price-modifiers/:id
```

#### Удаление модификатора
```
DELETE /price-modifiers/:id
```

#### Расчет цены
```
POST /price-modifiers/calculate
```

## Примеры использования

### 1. Создание модификатора с простым условием
```json
{
  "name": "Надбавка за премиум модель",
  "code": "PREMIUM_MODEL_SURCHARGE",
  "modifierType": "PERCENTAGE",
  "value": 10,
  "propertyId": 123,
  "propertyValue": "премиум",
  "priority": 1
}
```

### 2. Создание модификатора со сложным условием
```json
{
  "name": "Скидка для дорогих товаров",
  "code": "EXPENSIVE_ITEM_DISCOUNT",
  "modifierType": "PERCENTAGE",
  "value": -5,
  "conditionExpression": "propertyValue > 3000",
  "priority": 2
}
```

### 3. Расчет цены
```json
{
  "basePrice": 1500,
  "unitPrice": 3900,      // Цена за 1 м² после модификаторов
  "modifiedUnitPrice": 5850, // Итоговая цена с учетом размеров (3900 × 1.5)
  "quantity": 2,
  "coefficient": 1.2,
  "propertyValues": [
    {
      "propertyId": 123,
      "value": "премиум"
    }
  ]
}
```

## Архитектура

Модуль следует принципам Clean Architecture:

- **Domain Layer**: Бизнес-логика и сущности
- **Application Layer**: Use cases и порты
- **Infrastructure Layer**: Реализации репозиториев
- **Presentation Layer**: REST API контроллеры

## Тестирование

Модуль покрыт комплексными тестами:
- Unit-тесты для доменной логики
- Integration-тесты для репозиториев
- E2E-тесты для API endpoints

## Разработка

### Запуск тестов
```bash
npm run test pricing
```

### Запуск с покрытием
```bash
npm run test:cov pricing
```

## Документация

- [Синтаксис условий](documentation/condition-syntax.md) - подробное описание языка условий
- [API Swagger](/api) - интерактивная документация API
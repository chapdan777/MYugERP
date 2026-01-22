# Property Headers Module (Шапки ДС)

Модуль для управления шапками свойств в системе MYugERP.

## Описание

Модуль позволяет создавать и управлять шаблонами часто используемых комбинаций свойств, которые можно применять к продуктам в рамках определенных типов заказов.

## Основные функции

### Шапки свойств (Property Headers)
- Создание/редактирование шапок свойств
- Активация/деактивация шапок
- Привязка шапок к типам заказов
- Управление описаниями шапок

### Элементы шапок (Property Header Items)
- Добавление свойств в шапки
- Управление значениями свойств в шапках
- Получение всех элементов конкретной шапки

## API Endpoints

### Property Headers
```
POST   /api/property-headers              # Создать шапку
GET    /api/property-headers              # Получить список шапок
GET    /api/property-headers/:id          # Получить шапку по ID
PUT    /api/property-headers/:id          # Обновить шапку
POST   /api/property-headers/:id/activate # Активировать шапку
POST   /api/property-headers/:id/deactivate # Деактивировать шапку
DELETE /api/property-headers/:id          # Удалить шапку
```

### Property Header Items
```
POST   /api/property-headers/:headerId/items    # Добавить элемент в шапку
GET    /api/property-headers/:headerId/items    # Получить элементы шапки
PUT    /api/property-headers/:headerId/items/:propertyId # Обновить значение элемента
DELETE /api/property-headers/:headerId/items/:propertyId # Удалить элемент из шапки
```

## Структура данных

### PropertyHeader
```typescript
{
  id: number;
  name: string;           // Название шапки
  orderTypeId: number;    // ID типа заказа
  description: string;    // Описание (опционально)
  isActive: boolean;      // Флаг активности
  createdAt: Date;
  updatedAt: Date;
}
```

### PropertyHeaderItem
```typescript
{
  headerId: number;       // ID шапки
  propertyId: number;     // ID свойства
  value: string;          // Значение свойства
  createdAt: Date;
}
```

## Бизнес-логика

### Конфликты значений
При изменении пользователем значения свойства, которое было установлено из шапки:
1. Показывается диалог: "Значение отличается от шаблона шапки. [Перенести в новую шапку] [Оставить в текущей шапке]"
2. При выборе "Оставить в текущей шапке" автоматически добавляется заметка: "Свойство '{name}' изменено с '{oldValue}' на '{newValue}'"

### Применение шапок
1. При создании продукта под шапкой → автоматическое заполнение свойств
2. Отслеживание источника значений свойств (из какой шапки они пришли)
3. Валидация принадлежности продукта к типу заказа шапки

## Техническая реализация

Модуль следует архитектуре Clean Architecture:
- **Domain Layer**: Сущности, сервисы домена, интерфейсы репозиториев
- **Application Layer**: Use Cases, DTOs
- **Infrastructure Layer**: Реализации репозиториев, мапперы, сущности БД
- **Presentation Layer**: Контроллеры, Swagger документация

## Миграции базы данных

Модуль включает SQL миграцию для создания необходимых таблиц:
- `property_headers` - таблица шапок
- `property_header_items` - таблица элементов шапок

## Тестирование

Модуль покрыт unit-тестами для:
- Доменных сущностей
- Бизнес-логики
- Валидаций

## Интеграция

Модуль готов к интеграции с:
- Orders module (через orderTypeId)
- Properties module (через propertyId)
- Products module (для применения шапок к продуктам)
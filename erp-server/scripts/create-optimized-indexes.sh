#!/bin/bash
# Скрипт для создания оптимизированных индексов в PostgreSQL
# Автор: Index Optimization Script
# Дата: Январь 2026

set -e

CONTAINER_NAME="erp-postgres"
DATABASE="erp_production"
DB_USER="postgres"

echo "=== Создание оптимизированных индексов ==="
echo "Контейнер: $CONTAINER_NAME"
echo "База данных: $DATABASE"
echo "Начало: $(date)"
echo ""

# Функция для выполнения SQL команд
execute_sql() {
    local sql_command="$1"
    echo "Выполняю: $sql_command"
    docker exec $CONTAINER_NAME psql -U $DB_USER -d $DATABASE -c "$sql_command"
    echo ""
}

# Проверка наличия контейнера
if ! docker ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ Контейнер $CONTAINER_NAME не найден"
    echo "💡 Запустите PostgreSQL контейнер"
    exit 1
fi

echo "✅ Контейнер найден"

# Создание индексов для таблицы price_modifiers
echo "🔧 Создание индексов для price_modifiers..."

execute_sql 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_modifiers_active_priority ON price_modifiers ("isActive", priority) WHERE "isActive" = true;'

execute_sql 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_modifiers_property_lookup ON price_modifiers ("propertyId", "propertyValue") WHERE "propertyId" IS NOT NULL;'

execute_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_modifiers_code ON price_modifiers (code);"

execute_sql 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_modifiers_dates ON price_modifiers ("startDate", "endDate") WHERE "startDate" IS NOT NULL OR "endDate" IS NOT NULL;'

# Анализ таблиц для обновления статистики
echo "📊 Анализ таблиц для обновления статистики..."

TABLES=("price_modifiers")

for table in "${TABLES[@]}"; do
    echo "Анализ таблицы: $table"
    docker exec $CONTAINER_NAME psql -U $DB_USER -d $DATABASE -c "ANALYZE $table;" 2>/dev/null || echo "Таблица $table не найдена - пропущена"
done

echo ""
echo "✅ Все индексы успешно созданы!"
echo "🏁 Завершено: $(date)"

# Показать созданные индексы
echo ""
echo "📋 Созданные индексы:"
docker exec $CONTAINER_NAME psql -U $DB_USER -d $DATABASE -c "
    SELECT 
        tablename,
        indexname,
        indexdef
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%'
    ORDER BY tablename, indexname;
"
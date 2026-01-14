#!/bin/bash

# Скрипт для анализа и оптимизации database queries в Docker окружении
# Автор: Performance Optimization Script
# Дата: Январь 2026

echo "=== Анализ и оптимизация database queries (Docker PostgreSQL) ==="
echo "Начало анализа: $(date)"
echo ""

# Проверка наличия необходимых инструментов
check_tools() {
    echo "🔍 Проверка необходимых инструментов..."
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker не найден"
        return 1
    fi
    
    echo "✅ Docker доступен"
    return 0
}

# Проверка запущенного PostgreSQL контейнера
check_postgres_container() {
    echo "🐋 Проверка PostgreSQL контейнера..."
    
    # Ищем контейнеры с postgres в имени образа
    CONTAINER_ID=$(docker ps --format "{{.ID}}\t{{.Image}}" | grep -i postgres | head -1 | cut -f1)
    
    if [ -z "$CONTAINER_ID" ]; then
        echo "❌ PostgreSQL контейнер не найден"
        echo "💡 Проверьте запущенные контейнеры: docker ps"
        return 1
    fi
    
    CONTAINER_NAME=$(docker ps --filter "id=$CONTAINER_ID" --format "{{.Names}}")
    echo "✅ Найден PostgreSQL контейнер: $CONTAINER_NAME (ID: $CONTAINER_ID)"
    return 0
}

# Выполнение SQL команд в контейнере
execute_sql() {
    local sql_command="$1"
    local database="${2:-myugerp}"
    
    docker exec $CONTAINER_ID \
        psql -U postgres -d "$database" -c "$sql_command" 2>/dev/null
}

# Анализ медленных запросов
analyze_slow_queries() {
    echo "🐢 Анализ медленных запросов..."
    
    # Включение расширения pg_stat_statements если не включено
    execute_sql "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;" postgres >/dev/null 2>&1
    
    # Получение статистики по медленным запросам
    echo "📊 Статистика медленных запросов:"
    execute_sql "
        SELECT 
            calls,
            ROUND(total_time::numeric, 2) as total_time_ms,
            ROUND(mean_time::numeric, 2) as mean_time_ms,
            ROUND(stddev_time::numeric, 2) as stddev_time_ms,
            rows,
            ROUND(100.0 * shared_blks_hit / NULLIF(shared_blks_hit + shared_blks_read, 0), 2) AS hit_percent,
            SUBSTRING(query FROM 1 FOR 100) as query_snippet
        FROM pg_stat_statements 
        WHERE mean_time > 50
        ORDER BY mean_time DESC
        LIMIT 10;
    "
}

# Анализ использования индексов
analyze_indexes() {
    echo ".CreateIndex Анализ использования индексов..."
    
    echo "📊 Индексы с низким использованием:"
    execute_sql "
        SELECT 
            schemaname,
            tablename,
            indexname,
            idx_scan,
            idx_tup_read,
            idx_tup_fetch,
            pg_size_pretty(pg_relation_size(indexrelid)) as size
        FROM pg_stat_user_indexes 
        WHERE idx_scan < 10
        ORDER BY pg_relation_size(indexrelid) DESC;
    "
    
    echo "📊 Таблицы без индексов:"
    execute_sql "
        SELECT 
            schemaname,
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN (
            SELECT tablename FROM pg_indexes WHERE schemaname = 'public'
        )
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
    "
}

# Анализ конфигурации PostgreSQL
analyze_config() {
    echo "⚙️ Анализ конфигурации PostgreSQL..."
    
    echo "📊 Основные параметры конфигурации:"
    execute_sql "
        SELECT 
            name,
            setting,
            unit,
            short_desc
        FROM pg_settings 
        WHERE name IN (
            'shared_buffers',
            'work_mem', 
            'maintenance_work_mem',
            'effective_cache_size',
            'checkpoint_completion_target',
            'wal_buffers',
            'default_statistics_target'
        )
        ORDER BY name;
    " postgres
}

# Рекомендации по оптимизации для Docker
generate_docker_recommendations() {
    echo "🐳 Рекомендации по оптимизации для Docker окружения:"
    echo ""
    echo "1. 🐋 Docker-specific оптимизации:"
    echo "   - Увеличить shm-size для контейнера: --shm-size=1g"
    echo "   - Настроить volume mounts для persistent data"
    echo "   - Использовать dedicated network для БД"
    echo ""
    echo "2. 📈 PostgreSQL конфигурация:"
    echo "   - shared_buffers = 256MB (для dev)"
    echo "   - work_mem = 4MB"
    echo "   - effective_cache_size = 1GB"
    echo ""
    echo "3. 💾 Volume optimization:"
    echo "   - Использовать named volumes вместо bind mounts"
    echo "   - Настроить backup стратегию"
    echo "   - Мониторить disk space usage"
    echo ""
    echo "4. 🔄 Monitoring:"
    echo "   - Включить логирование медленных запросов"
    echo "   - Настроить health checks"
    echo "   - Мониторить container resources"
}

# Создание отчета
create_report() {
    echo "📝 Создание отчета об оптимизации..."
    
    REPORT_FILE="performance-results/db-optimization-docker-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$REPORT_FILE" << EOF
# Отчет по оптимизации database queries (Docker PostgreSQL)
## Дата: $(date)

### Информация о контейнере
- **Container ID:** $CONTAINER_ID
- **Container Name:** $CONTAINER_NAME

### Результаты анализа

$(analyze_slow_queries)
$(analyze_indexes)
$(analyze_config)

### Рекомендации для Docker окружения

$(generate_docker_recommendations)

### Docker Compose рекомендации

\`\`\`yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    shm_size: 1g
    environment:
      POSTGRES_DB: myugerp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
\`\`\`

---
*Автоматически сгенерированный отчет*
*Performance Optimization Script v1.0 (Docker Edition)*
EOF

    echo "✅ Отчет сохранен в: $REPORT_FILE"
}

# Основной workflow
main() {
    if ! check_tools; then
        echo "❌ Завершение из-за отсутствия необходимых инструментов"
        exit 1
    fi
    
    if ! check_postgres_container; then
        echo "❌ Завершение из-за отсутствия PostgreSQL контейнера"
        exit 1
    fi
    
    echo ""
    analyze_slow_queries
    echo ""
    analyze_indexes
    echo ""
    analyze_config
    echo ""
    generate_docker_recommendations
    echo ""
    create_report
    
    echo ""
    echo "✅ Анализ завершен успешно!"
    echo "🏁 Время завершения: $(date)"
}

# Запуск скрипта
main "$@"
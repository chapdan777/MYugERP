#!/bin/bash

# Скрипт для анализа и оптимизации database queries
# Автор: Performance Optimization Script
# Дата: Январь 2026

echo "=== Анализ и оптимизация database queries ==="
echo "Начало анализа: $(date)"
echo ""

# Проверка наличия необходимых инструментов
check_tools() {
    echo "🔍 Проверка необходимых инструментов..."
    
    if ! command -v psql &> /dev/null; then
        echo "❌ PostgreSQL клиент не найден"
        return 1
    fi
    
    if ! command -v pg_isready &> /dev/null; then
        echo "❌ pg_isready не найден"
        return 1
    fi
    
    echo "✅ Все инструменты доступны"
    return 0
}

# Проверка подключения к базе данных
check_database_connection() {
    echo "🔌 Проверка подключения к базе данных..."
    
    if pg_isready -h localhost -p 5432 -U postgres > /dev/null 2>&1; then
        echo "✅ Подключение к базе данных установлено"
        return 0
    else
        echo "❌ Не удалось подключиться к базе данных"
        echo "💡 Убедитесь, что PostgreSQL запущен и доступен"
        return 1
    fi
}

# Анализ медленных запросов
analyze_slow_queries() {
    echo "🐢 Анализ медленных запросов..."
    
    # Включение логирования медленных запросов (если не включено)
    psql -h localhost -p 5432 -U postgres -d myugerp -c "
        ALTER SYSTEM SET log_min_duration_statement = 1000;
        SELECT pg_reload_conf();
    " > /dev/null 2>&1
    
    # Получение статистики по медленным запросам
    echo "📊 Статистика медленных запросов:"
    psql -h localhost -p 5432 -U postgres -d myugerp -c "
        SELECT 
            calls,
            total_time,
            mean_time,
            stddev_time,
            rows,
            100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent,
            regexp_replace(query, '[\s]+', ' ', 'g') as query
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
    psql -h localhost -p 5432 -U postgres -d myugerp -c "
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
    psql -h localhost -p 5432 -U postgres -d myugerp -c "
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

# Анализ блокировок
analyze_locks() {
    echo "🔒 Анализ блокировок..."
    
    echo "📊 Активные блокировки:"
    psql -h localhost -p 5432 -U postgres -d myugerp -c "
        SELECT 
            blocked_locks.pid AS blocked_pid,
            blocked_activity.usename AS blocked_user,
            blocking_locks.pid AS blocking_pid,
            blocking_activity.usename AS blocking_user,
            blocked_activity.query AS blocked_statement,
            blocking_activity.query AS blocking_statement
        FROM pg_catalog.pg_locks blocked_locks
        JOIN pg_catalog.pg_stat_activity blocked_activity 
            ON blocked_activity.pid = blocked_locks.pid
        JOIN pg_catalog.pg_locks blocking_locks 
            ON blocking_locks.locktype = blocked_locks.locktype
            AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
            AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
            AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
            AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
            AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
            AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
            AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
            AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
            AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
            AND blocking_locks.pid != blocked_locks.pid
        JOIN pg_catalog.pg_stat_activity blocking_activity 
            ON blocking_activity.pid = blocking_locks.pid
        WHERE NOT blocked_locks.granted;
    "
}

# Рекомендации по оптимизации
generate_recommendations() {
    echo "💡 Рекомендации по оптимизации:"
    echo ""
    echo "1. 📈 Индексация:"
    echo "   - Создать индексы на часто используемых колонках WHERE"
    echo "   - Рассмотреть составные индексы для сложных запросов"
    echo "   - Удалить неиспользуемые индексы"
    echo ""
    echo "2. 🔧 Конфигурация PostgreSQL:"
    echo "   - Увеличить shared_buffers (25% от RAM)"
    echo "   - Настроить work_mem для сложных запросов"
    echo "   - Оптимизировать checkpoint параметры"
    echo ""
    echo "3. 🎯 Запросы:"
    echo "   - Использовать prepared statements"
    echo "   - Избегать SELECT *"
    echo "   - Оптимизировать JOIN операции"
    echo "   - Использовать LIMIT для больших выборок"
    echo ""
    echo "4. 🔄 Мониторинг:"
    echo "   - Регулярно анализировать pg_stat_statements"
    echo "   - Мониторить использование памяти"
    echo "   - Отслеживать блокировки в реальном времени"
}

# Создание отчета
create_report() {
    echo "📝 Создание отчета об оптимизации..."
    
    REPORT_FILE="performance-results/db-optimization-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$REPORT_FILE" << EOF
# Отчет по оптимизации database queries
## Дата: $(date)

### Результаты анализа

$(analyze_slow_queries)
$(analyze_indexes)
$(analyze_locks)

### Рекомендации

$(generate_recommendations)

---
*Автоматически сгенерированный отчет*
*Performance Optimization Script v1.0*
EOF

    echo "✅ Отчет сохранен в: $REPORT_FILE"
}

# Основной workflow
main() {
    if ! check_tools; then
        echo "❌ Завершение из-за отсутствия необходимых инструментов"
        exit 1
    fi
    
    if ! check_database_connection; then
        echo "❌ Завершение из-за проблем с подключением к БД"
        exit 1
    fi
    
    echo ""
    analyze_slow_queries
    echo ""
    analyze_indexes
    echo ""
    analyze_locks
    echo ""
    generate_recommendations
    echo ""
    create_report
    
    echo ""
    echo "✅ Анализ завершен успешно!"
    echo "🏁 Время завершения: $(date)"
}

# Запуск скрипта
main "$@"
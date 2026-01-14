#!/bin/bash
# Система мониторинга PostgreSQL в Docker
# Автор: PostgreSQL Monitoring System
# Дата: Январь 2026

set -e

CONTAINER_NAME="erp-postgres"
DATABASE="erp_production"
DB_USER="postgres"
LOG_DIR="/Users/mironocean/Documents/Progs/MYugERP/erp-server/logs/postgres-monitoring"
REPORT_DIR="/Users/mironocean/Documents/Progs/MYugERP/erp-server/reports/postgres-monitoring"

# Создание директорий
mkdir -p "$LOG_DIR" "$REPORT_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$LOG_DIR/monitoring_$TIMESTAMP.log"
REPORT_FILE="$REPORT_DIR/report_$TIMESTAMP.md"

echo "=== PostgreSQL Monitoring Report ===" | tee "$LOG_FILE"
echo "Timestamp: $(date)" | tee -a "$LOG_FILE"
echo "Container: $CONTAINER_NAME" | tee -a "$LOG_FILE"
echo "Database: $DATABASE" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Функция для выполнения SQL команд
execute_sql() {
    local sql_command="$1"
    local description="$2"
    
    echo "🔍 $description:" | tee -a "$LOG_FILE"
    echo '```' >> "$REPORT_FILE"
    echo "**$description:**" >> "$REPORT_FILE"
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DATABASE" -c "$sql_command" 2>&1 | tee -a "$LOG_FILE" | tee -a "$REPORT_FILE"
    echo '```' >> "$REPORT_FILE"
    echo "" | tee -a "$LOG_FILE" | tee -a "$REPORT_FILE"
}

# Проверка контейнера
if ! docker ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ Контейнер $CONTAINER_NAME не найден!" | tee -a "$LOG_FILE"
    echo "💡 Запустите PostgreSQL контейнер" | tee -a "$LOG_FILE"
    exit 1
fi

echo "✅ Контейнер PostgreSQL запущен" | tee -a "$LOG_FILE"

# 1. Docker ресурсы
echo "🐋 Docker Container Resources:" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" "$CONTAINER_NAME" | tee -a "$LOG_FILE" | tee -a "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
echo "" | tee -a "$LOG_FILE" | tee -a "$REPORT_FILE"

# 2. Соединения
execute_sql "
    SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections,
        count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction,
        max(backend_start) as newest_connection,
        min(backend_start) as oldest_connection
    FROM pg_stat_activity 
    WHERE datname = '$DATABASE';
" "Connection Statistics"

# 3. Медленные запросы
execute_sql "
    SELECT 
        calls,
        ROUND(mean_time::numeric, 2) as avg_time_ms,
        ROUND(total_time::numeric, 2) as total_time_ms,
        ROUND(stddev_time::numeric, 2) as stddev_time_ms,
        rows,
        substring(query from 1 for 150) as query_sample
    FROM pg_stat_statements 
    WHERE mean_time > 100
    ORDER BY mean_time DESC
    LIMIT 10;
" "Slow Queries (>100ms)"

# 4. Использование индексов
execute_sql "
    SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch,
        pg_size_pretty(pg_relation_size(indexrelid)) as index_size
    FROM pg_stat_user_indexes 
    WHERE idx_scan < 5
    ORDER BY pg_relation_size(indexrelid) DESC
    LIMIT 10;
" "Underutilized Indexes"

# 5. Размеры таблиц
execute_sql "
    SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
        pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as indexes_size
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
" "Table Sizes"

# 6. Блокировки
execute_sql "
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
        AND blocking_locks.pid != blocked_locks.pid
    JOIN pg_catalog.pg_stat_activity blocking_activity 
        ON blocking_activity.pid = blocking_locks.pid
    WHERE NOT blocked_locks.granted;
" "Blocking Queries"

# 7. Vacuum статистика
execute_sql "
    SELECT 
        schemaname,
        tablename,
        last_vacuum,
        last_autovacuum,
        last_analyze,
        last_autoanalyze,
        vacuum_count,
        autovacuum_count,
        analyze_count,
        autoanalyze_count
    FROM pg_stat_user_tables
    ORDER BY last_vacuum NULLS FIRST, last_autovacuum NULLS FIRST;
" "Vacuum Statistics"

# 8. Cache hit ratio
execute_sql "
    SELECT 
        sum(heap_blks_read) as heap_read,
        sum(heap_blks_hit) as heap_hit,
        round(sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read) + 1)::numeric * 100, 2) as ratio
    FROM pg_statio_user_tables;
" "Cache Hit Ratio"

# Создание summary
echo "## Summary" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "**Monitoring completed:** $(date)" >> "$REPORT_FILE"
echo "**Log file:** $LOG_FILE" >> "$REPORT_FILE"
echo "**Report file:** $REPORT_FILE" >> "$REPORT_FILE"

echo "✅ Мониторинг завершен!" | tee -a "$LOG_FILE"
echo "📊 Отчет сохранен: $REPORT_FILE" | tee -a "$LOG_FILE"
echo "📝 Логи: $LOG_FILE" | tee -a "$LOG_FILE"
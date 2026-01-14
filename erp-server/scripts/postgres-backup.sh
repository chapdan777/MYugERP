#!/bin/bash
# Автоматизированная система backup'ов PostgreSQL
# Автор: PostgreSQL Backup System
# Дата: Январь 2026

set -e

CONTAINER_NAME="erp-postgres"
DATABASE="erp_production"
DB_USER="postgres"
BACKUP_BASE_DIR="/Users/mironocean/Documents/Progs/MYugERP/erp-server/backups/postgres"
LOG_DIR="/Users/mironocean/Documents/Progs/MYugERP/erp-server/logs/postgres-backup"

# Создание директорий
mkdir -p "$BACKUP_BASE_DIR/daily" "$BACKUP_BASE_DIR/weekly" "$BACKUP_BASE_DIR/monthly" "$LOG_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE_ONLY=$(date +%Y%m%d)
DAY_OF_WEEK=$(date +%u)  # 1-7 (понедельник-воскресенье)
DAY_OF_MONTH=$(date +%d) # 01-31

LOG_FILE="$LOG_DIR/backup_$TIMESTAMP.log"

echo "=== PostgreSQL Backup Started ===" > "$LOG_FILE"
echo "Timestamp: $(date)" | tee -a "$LOG_FILE"
echo "Container: $CONTAINER_NAME" | tee -a "$LOG_FILE"
echo "Database: $DATABASE" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Проверка контейнера
if ! docker ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ Контейнер $CONTAINER_NAME не найден!" | tee -a "$LOG_FILE"
    echo "💡 Запустите PostgreSQL контейнер" | tee -a "$LOG_FILE"
    exit 1
fi

echo "✅ Контейнер PostgreSQL запущен" | tee -a "$LOG_FILE"

# Функция для создания backup'а
create_backup() {
    local backup_type="$1"
    local backup_dir="$BACKUP_BASE_DIR/$backup_type"
    local backup_file="$backup_dir/${DATABASE}_${backup_type}_${TIMESTAMP}.sql"
    local compressed_file="${backup_file}.gz"
    
    echo "🔧 Создание $backup_type backup..." | tee -a "$LOG_FILE"
    
    # Создание dump
    if docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DATABASE" > "$backup_file" 2>>"$LOG_FILE"; then
        # Сжатие
        gzip "$backup_file"
        echo "✅ $backup_type backup создан: $compressed_file" | tee -a "$LOG_FILE"
        
        # Получение размера
        SIZE=$(du -h "$compressed_file" | cut -f1)
        echo "📦 Размер: $SIZE" | tee -a "$LOG_FILE"
    else
        echo "❌ Ошибка создания $backup_type backup" | tee -a "$LOG_FILE"
        return 1
    fi
}

# Создание daily backup (всегда)
create_backup "daily"

# Создание weekly backup (по понедельникам)
if [ "$DAY_OF_WEEK" -eq 1 ]; then
    create_backup "weekly"
fi

# Создание monthly backup (1-го числа месяца)
if [ "$DAY_OF_MONTH" -eq 01 ]; then
    create_backup "monthly"
fi

# Очистка старых backup'ов
echo "" | tee -a "$LOG_FILE"
echo "🧹 Очистка старых backup'ов..." | tee -a "$LOG_FILE"

# Удаление daily backup'ов старше 7 дней
find "$BACKUP_BASE_DIR/daily" -name "*.sql.gz" -mtime +7 -delete 2>>"$LOG_FILE"
echo "✅ Удалены daily backup'ы старше 7 дней" | tee -a "$LOG_FILE"

# Удаление weekly backup'ов старше 30 дней
find "$BACKUP_BASE_DIR/weekly" -name "*.sql.gz" -mtime +30 -delete 2>>"$LOG_FILE"
echo "✅ Удалены weekly backup'ы старше 30 дней" | tee -a "$LOG_FILE"

# Удаление monthly backup'ов старше 90 дней
find "$BACKUP_BASE_DIR/monthly" -name "*.sql.gz" -mtime +90 -delete 2>>"$LOG_FILE"
echo "✅ Удалены monthly backup'ы старше 90 дней" | tee -a "$LOG_FILE"

# Статистика backup'ов
echo "" | tee -a "$LOG_FILE"
echo "📊 Статистика backup'ов:" | tee -a "$LOG_FILE"
echo "Daily backups: $(ls -1 "$BACKUP_BASE_DIR/daily"/*.sql.gz 2>/dev/null | wc -l | tr -d ' ')" | tee -a "$LOG_FILE"
echo "Weekly backups: $(ls -1 "$BACKUP_BASE_DIR/weekly"/*.sql.gz 2>/dev/null | wc -l | tr -d ' ')" | tee -a "$LOG_FILE"
echo "Monthly backups: $(ls -1 "$BACKUP_BASE_DIR/monthly"/*.sql.gz 2>/dev/null | wc -l | tr -d ' ')" | tee -a "$LOG_FILE"

# Общий размер backup'ов
TOTAL_SIZE=$(du -sh "$BACKUP_BASE_DIR" 2>/dev/null | cut -f1)
echo "Общий размер backup'ов: $TOTAL_SIZE" | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"
echo "✅ Backup завершен успешно!" | tee -a "$LOG_FILE"
echo "🏁 Время завершения: $(date)" | tee -a "$LOG_FILE"
echo "📝 Лог файл: $LOG_FILE" | tee -a "$LOG_FILE"

# Отправка уведомления (опционально)
# echo "PostgreSQL backup completed at $(date)" | mail -s "PostgreSQL Backup Report" admin@example.com
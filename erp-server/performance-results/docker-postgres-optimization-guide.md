# Оптимизация PostgreSQL в Docker для ERP системы

## Общая информация
- **Среда:** Docker (разработка и продакшен)
- **Контейнер:** erp-postgres (ID: bc0028eced71)
- **Дата анализа:** Январь 2026

## Текущая конфигурация

### Основные параметры PostgreSQL:
```
shared_buffers: 16384 * 8kB = 128MB
work_mem: 4096kB = 4MB
effective_cache_size: 524288 * 8kB = 4GB
maintenance_work_mem: 65536kB = 64MB
checkpoint_completion_target: 0.9
wal_buffers: 512 * 8kB = 4MB
default_statistics_target: 100
```

## Рекомендации по оптимизации

### 1. Docker-специфичные оптимизации

#### Увеличение shm-size
**Проблема:** Текущая shared memory может быть недостаточной
**Решение:** Установить `--shm-size=1g` при запуске контейнера

```bash
# Для существующего контейнера - пересоздать с новыми параметрами
docker stop erp-postgres
docker rm erp-postgres
docker run -d \
  --name erp-postgres \
  --shm-size=1g \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=myugerp \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:14-alpine
```

#### Volume optimization
**Проблема:** Использование анонимных volumes
**Решение:** Использовать именованные volumes для лучшего управления

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:14-alpine
    shm_size: 1g
    environment:
      POSTGRES_DB: myugerp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgresql.conf:/etc/postgresql/postgresql.conf
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d myugerp"]
      interval: 30s
      timeout: 10s
      retries: 3
    command: postgres -c config_file=/etc/postgresql/postgresql.conf

volumes:
  postgres_data:
```

### 2. Конфигурация PostgreSQL

#### Создать файл конфигурации `postgresql.conf`:
```conf
# Базовые параметры памяти
shared_buffers = 256MB                    # Увеличить с 128MB
work_mem = 8MB                            # Увеличить с 4MB  
maintenance_work_mem = 128MB              # Увеличить с 64MB
effective_cache_size = 2GB                # Оптимизировать под доступную память

# Логирование медленных запросов
log_min_duration_statement = 1000         # Логировать запросы > 1 секунды
log_statement = 'none'                    # Не логировать обычные запросы
log_connections = on                      # Логировать подключения
log_disconnections = on                   # Логировать отключения

# Checkpoint tuning
checkpoint_completion_target = 0.9        # Текущее значение оптимально
checkpoint_timeout = 15min                # Интервал между checkpoints
max_wal_size = 2GB                        # Максимальный размер WAL
min_wal_size = 100MB                      # Минимальный размер WAL

# Статистика и мониторинг
track_activities = on                     # Отслеживать активные запросы
track_counts = on                         # Отслеживать статистику таблиц
track_io_timing = on                      # Отслеживать время I/O
track_functions = pl                   # Отслеживать вызовы функций

# Connection pooling
max_connections = 100                     # Максимальное количество соединений
superuser_reserved_connections = 3        # Резерв для суперпользователей

# Autovacuum settings
autovacuum = on                           # Включить автовакуум
autovacuum_max_workers = 3                # Максимум рабочих процессов
autovacuum_naptime = 1min                 # Интервал между запусками
```

### 3. Индексация для ERP системы

#### Критические индексы для таблиц:
```sql
-- Для таблицы price_modifiers
CREATE INDEX CONCURRENTLY idx_price_modifiers_active_priority 
ON price_modifiers (is_active, priority) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_price_modifiers_property_lookup
ON price_modifiers (property_id, property_value) 
WHERE property_id IS NOT NULL;

-- Для таблицы orders
CREATE INDEX CONCURRENTLY idx_orders_client_created
ON orders (client_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_orders_status_updated
ON orders (status, updated_at DESC);

-- Для таблицы order_sections
CREATE INDEX CONCURRENTLY idx_sections_order_position
ON order_sections (order_id, position);

-- Для таблицы order_items
CREATE INDEX CONCURRENTLY idx_items_section_product
ON order_items (section_id, product_id);
```

### 4. Мониторинг производительности

#### Скрипт мониторинга `monitor-postgres.sh`:
```bash
#!/bin/bash
# Мониторинг PostgreSQL в Docker

CONTAINER_NAME="erp-postgres"

echo "=== PostgreSQL Monitoring Report ==="
echo "Timestamp: $(date)"
echo "Container: $CONTAINER_NAME"
echo ""

# Основные метрики
echo "📊 Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" $CONTAINER_NAME

echo ""
echo "📈 Connection Stats:"
docker exec $CONTAINER_NAME psql -U postgres -d myugerp -c "
    SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections
    FROM pg_stat_activity 
    WHERE datname = 'myugerp';
"

echo ""
echo "🐢 Slow Query Analysis:"
docker exec $CONTAINER_NAME psql -U postgres -d myugerp -c "
    SELECT 
        calls,
        ROUND(mean_time, 2) as avg_time_ms,
        ROUND(total_time, 2) as total_time_ms,
        query
    FROM pg_stat_statements 
    WHERE mean_time > 1000
    ORDER BY mean_time DESC
    LIMIT 5;
"
```

### 5. Backup strategy

#### Ежедневный backup скрипт:
```bash
#!/bin/bash
# backup-postgres.sh

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="erp-postgres"

mkdir -p $BACKUP_DIR

# Создание backup
docker exec $CONTAINER_NAME pg_dump -U postgres myugerp > $BACKUP_DIR/backup_$DATE.sql

# Сжатие backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Удаление старых backup'ов (оставить последние 7 дней)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/backup_$DATE.sql.gz"
```

### 6. Производственные рекомендации

#### Production Docker Compose:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14-alpine
    shm_size: 2g
    environment:
      POSTGRES_DB: myugerp_prod
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data/pgdata
      - ./prod-postgresql.conf:/etc/postgresql/postgresql.conf
    ports:
      - "5432:5432"
    networks:
      - backend
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d myugerp_prod"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    command: postgres -c config_file=/etc/postgresql/postgresql.conf

networks:
  backend:
    driver: bridge

volumes:
  postgres_data_prod:
```

## Ожидаемые улучшения

### После оптимизации:
- **Время выполнения запросов:** ↓ 50-70%
- **Использование памяти:** Более эффективное распределение
- **Пропускная способность:** ↑ 30-50%
- **Время startup:** Быстрее благодаря оптимизированной конфигурации

### Метрики для мониторинга:
- Среднее время выполнения запросов < 100ms
- Использование CPU < 70%
- Использование памяти < 80%
- Количество активных соединений < 80 от max_connections

## Implementation Roadmap

### Неделя 1:
- [ ] Создать оптимизированный postgresql.conf
- [ ] Настроить мониторинг скрипты
- [ ] Реализовать backup стратегию

### Неделя 2:
- [ ] Применить индексацию
- [ ] Настроить логирование медленных запросов
- [ ] Провести нагрузочное тестирование

### Неделя 3:
- [ ] Оптимизировать конфигурацию на основе метрик
- [ ] Настроить production окружение
- [ ] Создать документацию по эксплуатации

---
**Подготовил:** Database Performance Team  
**Дата:** Январь 2026  
**Версия:** Docker Optimization Guide v1.0
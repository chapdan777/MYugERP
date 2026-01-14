# ERP Server - Руководство по развертыванию в продакшн

## 📋 Общая информация

**Название проекта:** ERP Server для Массив Юг  
**Версия:** 1.0  
**Дата последнего обновления:** Январь 2026  
**Среда развертывания:** Docker (PostgreSQL в контейнере)

## 🏗️ Архитектура системы

### Основные компоненты:
- **Backend:** NestJS (TypeScript)
- **База данных:** PostgreSQL 14 в Docker
- **ORM:** TypeORM
- **Тестирование:** Jest, Supertest, Artillery
- **Мониторинг:** Собственные скрипты Bash

### Модули системы:
1. **Pricing Module** - Система ценообразования с модификаторами
2. **Orders Module** - Управление заказами
3. **Products Module** - Каталог продукции
4. **Database Module** - Управление подключениями к БД

## 🐳 Docker развертывание

### Требования к системе:
- Docker Engine 20.10+
- Docker Compose 1.29+
- 4GB+ RAM
- 10GB+ свободного места на диске

### 1. Базовая настройка Docker

Создайте файл `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: erp-postgres-prod
    shm_size: 2g
    environment:
      POSTGRES_DB: erp_production
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data/pgdata
      - ./config/postgres/postgresql-optimized.conf:/etc/postgresql/postgresql.conf
    ports:
      - "5432:5432"
    networks:
      - erp-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d erp_production"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    command: postgres -c config_file=/etc/postgresql/postgresql.conf

  erp-server:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: erp-server-prod
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=erp_production
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
    ports:
      - "3000:3000"
    networks:
      - erp-network
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  erp-network:
    driver: bridge

volumes:
  postgres_data_prod:
```

### 2. Файл окружения `.env.production`

```env
# База данных
DB_HOST=postgres
DB_PORT=5432
DB_NAME=erp_production
DB_USER=erp_user
DB_PASSWORD=your_secure_password_here

# Приложение
NODE_ENV=production
PORT=3000

# Безопасность
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Логирование
LOG_LEVEL=info
```

### 3. Оптимизированная конфигурация PostgreSQL

Файл: `config/postgres/postgresql-optimized.conf`

```conf
# Основные настройки памяти
shared_buffers = 512MB
work_mem = 16MB
maintenance_work_mem = 256MB
effective_cache_size = 2GB

# Логирование
log_min_duration_statement = 1000
log_connections = on
log_disconnections = on
log_lock_waits = on

# Производительность
random_page_cost = 1.1
effective_io_concurrency = 200

# Автовакуум
autovacuum = on
autovacuum_max_workers = 4

# Статистика
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.track = all
```

## 🚀 Развертывание в продакшн

### Шаг 1: Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Шаг 2: Клонирование репозитория

```bash
git clone <ваш-репозиторий> erp-server
cd erp-server
```

### Шаг 3: Настройка конфигурации

```bash
# Создание файла окружения
cp .env.example .env.production
nano .env.production

# Установка безопасных паролей
# Генерация JWT секрета
openssl rand -base64 32
```

### Шаг 4: Запуск системы

```bash
# Запуск PostgreSQL
docker-compose -f docker-compose.prod.yml up -d postgres

# Ожидание запуска БД
sleep 30

# Создание индексов
docker exec erp-postgres-prod psql -U erp_user -d erp_production -c "
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_modifiers_active_priority 
    ON price_modifiers ("isActive", priority) WHERE "isActive" = true;
    
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_modifiers_property_lookup 
    ON price_modifiers ("propertyId", "propertyValue") WHERE "propertyId" IS NOT NULL;
    
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_modifiers_code 
    ON price_modifiers (code);
    
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_price_modifiers_dates 
    ON price_modifiers ("startDate", "endDate") WHERE "startDate" IS NOT NULL OR "endDate" IS NOT NULL;
    
    ANALYZE price_modifiers;
"

# Запуск основного приложения
docker-compose -f docker-compose.prod.yml up -d

# Проверка состояния
docker-compose -f docker-compose.prod.yml ps
```

## 📊 Мониторинг и обслуживание

### Ежедневные задачи

#### 1. Мониторинг производительности
```bash
# Запуск скрипта мониторинга
./scripts/monitor-postgres.sh

# Просмотр отчета
cat reports/postgres-monitoring/report_*.md
```

#### 2. Backup базы данных
```bash
# Ежедневный backup
./scripts/postgres-backup.sh

# Проверка backup'ов
ls -la backups/postgres/daily/
```

### Метрики для отслеживания

#### Критические метрики:
- **Время отклика API:** < 100ms
- **Использование CPU:** < 70%
- **Использование памяти:** < 80%
- **Активные соединения:** < 80 от max_connections
- **Cache hit ratio:** > 90%

#### Команды мониторинга:
```bash
# Ресурсы Docker
docker stats erp-postgres-prod erp-server-prod

# Соединения к БД
docker exec erp-postgres-prod psql -U erp_user -d erp_production -c "
    SELECT count(*) as connections,
           count(*) FILTER (WHERE state = 'active') as active
    FROM pg_stat_activity 
    WHERE datname = 'erp_production';
"

# Cache hit ratio
docker exec erp-postgres-prod psql -U erp_user -d erp_production -c "
    SELECT 
        round(sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read) + 1)::numeric * 100, 2) as cache_hit_ratio
    FROM pg_statio_user_tables;
"
```

## 🔧 Управление системой

### Обновление версии

```bash
# Остановка сервисов
docker-compose -f docker-compose.prod.yml down

# Pull новых образов
docker-compose -f docker-compose.prod.yml pull

# Запуск с новыми образами
docker-compose -f docker-compose.prod.yml up -d

# Проверка работоспособности
curl http://localhost:3000/health
```

### Расширение системы

#### Добавление новых таблиц:
1. Создать миграцию TypeORM
2. Обновить скрипт индексов
3. Добавить мониторинг новых таблиц

#### Увеличение производительности:
```bash
# Увеличение shared_buffers (в postgresql.conf)
shared_buffers = 1GB  # для 8GB RAM сервера

# Добавление дополнительных worker процессов
max_worker_processes = 16
max_parallel_workers = 8
```

## 🛡️ Безопасность

### Рекомендации по безопасности:

1. **Сетевая безопасность:**
   - Использовать firewall (ufw)
   - Ограничить доступ к портам
   - Использовать reverse proxy (nginx)

2. **Безопасность базы данных:**
   - Сложные пароли для пользователей
   - Регулярные обновления PostgreSQL
   - Ограничение доступа по IP

3. **Безопасность приложения:**
   - HTTPS/TLS для API
   - Rate limiting
   - Валидация всех входных данных

### Пример nginx конфигурации:
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
}
```

## 🆘 Устранение неполадок

### Частые проблемы и решения:

#### 1. База данных не запускается
```bash
# Проверка логов
docker logs erp-postgres-prod

# Проверка дискового пространства
df -h

# Проверка прав на volume
docker volume inspect postgres_data_prod
```

#### 2. Медленные запросы
```bash
# Включение логирования медленных запросов
docker exec erp-postgres-prod psql -U erp_user -d erp_production -c "
    ALTER SYSTEM SET log_min_duration_statement = 1000;
    SELECT pg_reload_conf();
"

# Анализ планов выполнения
docker exec erp-postgres-prod psql -U erp_user -d erp_production -c "
    EXPLAIN ANALYZE SELECT * FROM price_modifiers WHERE \"isActive\" = true;
"
```

#### 3. Проблемы с памятью
```bash
# Мониторинг использования памяти
docker stats --format "table {{.Container}}\t{{.MemUsage}}\t{{.MemPerc}}"

# Очистка неиспользуемых образов
docker system prune -af
```

## 📞 Поддержка

### Контакты технической поддержки:
- **Email:** support@myuger.ru
- **Телефон:** +7 (XXX) XXX-XX-XX
- **Внутренний чат:** #erp-support

### Полезные ссылки:
- [Документация API](./docs/api-documentation.md)
- [Руководство пользователя](./src/modules/pricing/documentation/user-guide.md)
- [Алгоритмы ценообразования](./src/modules/pricing/documentation/price-calculation-algorithm.md)

---

**⚠️ ВАЖНО:** Перед развертыванием в продакшн обязательно протестируйте все компоненты в staging окружении!

**📅 Последнее обновление:** Январь 2026  
**📝 Версия документа:** 1.0
# Отчет по оптимизации database queries (Docker PostgreSQL)
## Дата: Mon Jan 12 16:15:54 MSK 2026

### Информация о контейнере
- **Container ID:** bc0028eced71
- **Container Name:** erp-postgres

### Результаты анализа

🐢 Анализ медленных запросов...
📊 Статистика медленных запросов:
.CreateIndex Анализ использования индексов...
📊 Индексы с низким использованием:
📊 Таблицы без индексов:
⚙️ Анализ конфигурации PostgreSQL...
📊 Основные параметры конфигурации:
             name             | setting | unit |                                        short_desc                                        
------------------------------+---------+------+------------------------------------------------------------------------------------------
 checkpoint_completion_target | 0.9     |      | Time spent flushing dirty buffers during checkpoint, as fraction of checkpoint interval.
 default_statistics_target    | 100     |      | Sets the default statistics target.
 effective_cache_size         | 524288  | 8kB  | Sets the planner's assumption about the total size of the data caches.
 maintenance_work_mem         | 65536   | kB   | Sets the maximum memory to be used for maintenance operations.
 shared_buffers               | 16384   | 8kB  | Sets the number of shared memory buffers used by the server.
 wal_buffers                  | 512     | 8kB  | Sets the number of disk-page buffers in shared memory for WAL.
 work_mem                     | 4096    | kB   | Sets the maximum memory to be used for query workspaces.
(7 rows)

### Рекомендации для Docker окружения

🐳 Рекомендации по оптимизации для Docker окружения:

1. 🐋 Docker-specific оптимизации:
   - Увеличить shm-size для контейнера: --shm-size=1g
   - Настроить volume mounts для persistent data
   - Использовать dedicated network для БД

2. 📈 PostgreSQL конфигурация:
   - shared_buffers = 256MB (для dev)
   - work_mem = 4MB
   - effective_cache_size = 1GB

3. 💾 Volume optimization:
   - Использовать named volumes вместо bind mounts
   - Настроить backup стратегию
   - Мониторить disk space usage

4. 🔄 Monitoring:
   - Включить логирование медленных запросов
   - Настроить health checks
   - Мониторить container resources

### Docker Compose рекомендации

```yaml
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
```

---
*Автоматически сгенерированный отчет*
*Performance Optimization Script v1.0 (Docker Edition)*

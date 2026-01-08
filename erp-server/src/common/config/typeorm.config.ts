import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

// Загружаем переменные окружения
config();

/**
 * Конфигурация TypeORM для подключения к PostgreSQL
 * Используется для миграций и в runtime
 */
export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'erp_production',
  entities: [__dirname + '/../modules/**/infrastructure/persistence/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false, // ВАЖНО: всегда false в production, используем миграции
  logging: process.env.DATABASE_LOGGING === 'true',
  migrationsRun: false, // Миграции запускаются вручную
};

// DataSource для CLI команд миграций
const AppDataSource = new DataSource(typeOrmConfig);

export default AppDataSource;

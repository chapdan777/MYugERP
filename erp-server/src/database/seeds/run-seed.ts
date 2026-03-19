#!/usr/bin/env ts-node

import { DataSource } from 'typeorm';
import { runInitialSeed } from './initial-seed';
import { seedFacadeBomSetup } from './facade-bom-setup.seed';
import { seedRecoveryData } from './recovery-data.seed';
import { seedRouteTemplates } from './route-templates.seed';
import { seedTestOrder } from './create-test-order.seed';
import { seedCleanupAndFinalize } from './cleanup-and-finalize.seed';
import * as dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

/**
 * CLI скрипт для запуска seed данных
 * Использование: npm run seed
 */
async function main() {
  // Создаем DataSource для подключения к БД
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'erp_db',
    entities: [__dirname + '/../../modules/**/infrastructure/persistence/**/*.entity{.ts,.js}'],
    synchronize: false, // Используем миграции!
    logging: false,
  });

  try {
    console.log('🔌 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Connected to database');

    console.log('🌱 Running initial seed...');
    await runInitialSeed(dataSource);
    console.log('🌱 Running Facade BOM Setup seed...');
    await seedFacadeBomSetup(dataSource);
    console.log('🌱 Running Recovery Data seed...');
    await seedRecoveryData(dataSource);
    console.log('🌱 Running Route Templates seed...');
    await seedRouteTemplates(dataSource);
    console.log('🌱 Running Test Order seed...');
    await seedTestOrder(dataSource);
    console.log('🌱 Running Cleanup and Finalization seed...');
    await seedCleanupAndFinalize(dataSource);
    console.log('✅ Seed completed successfully');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Запускаем главную функцию
main();

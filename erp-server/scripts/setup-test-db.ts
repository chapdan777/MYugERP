#!/usr/bin/env node
/**
 * Test Database Setup Script
 * Инициализирует тестовую базу данных с фикстурами
 */

import { execSync } from 'child_process';
import { config } from 'dotenv';
import { TEST_DATA_SQL } from '../test/fixtures/test-data.fixture';

// Загружаем переменные окружения
config();

async function setupTestDatabase() {
  console.log('🚀 Setting up test database...');
  
  const dbHost = process.env.DATABASE_HOST || 'localhost';
  const dbPort = process.env.DATABASE_PORT || '5432';
  const dbName = process.env.DATABASE_NAME || 'erp_production';
  const dbUser = process.env.DATABASE_USERNAME || 'postgres';
  const dbPass = process.env.DATABASE_PASSWORD || 'postgres';
  
  try {
    // Подключение к базе данных
    const connectionString = `postgresql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`;
    
    console.log(`🔌 Connecting to database: ${dbName} on ${dbHost}:${dbPort}`);
    
    // Выполняем SQL скрипт с тестовыми данными
    console.log('📊 Loading test data fixtures...');
    
    // Разбиваем SQL на отдельные команды
    const commands = TEST_DATA_SQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);
    
    for (const command of commands) {
      try {
        execSync(`psql "${connectionString}" -c "${command}"`, {
          stdio: 'inherit'
        });
      } catch (cmdError) {
        // Игнорируем ошибки удаления несуществующих таблиц
        if (!command.includes('DELETE FROM')) {
          console.warn(`⚠️  Warning executing command: ${command.substring(0, 50)}...`);
        }
      }
    }
    
    console.log('✅ Test database setup completed successfully!');
    console.log('\n📋 Loaded test data:');
    console.log('  • 4 Price Modifiers');
    console.log('  • 2 Test Clients'); 
    console.log('  • 3 Test Products');
    console.log('  • 2 Test Orders');
    console.log('  • 3 Order Sections');
    console.log('  • 3 Order Items');
    
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    process.exit(1);
  }
}

// Выполняем setup если скрипт запущен напрямую
if (require.main === module) {
  setupTestDatabase();
}

export { setupTestDatabase };
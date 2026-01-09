/**
 * Скрипт проверки структуры базы данных ERP-сервера
 * Использование: node check-database.js
 */

require('dotenv').config();
const { DataSource } = require('typeorm');

// Цвета для вывода
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.blue}╔════════════════════════════════════════════════════════════╗\n║ ${msg.padEnd(59)}║\n╚════════════════════════════════════════════════════════════╝${colors.reset}`),
};

// Ожидаемые таблицы в БД
const expectedTables = [
  'users',
  'user_properties',
  'products',
  'product_properties',
  'properties',
  'property_dependencies',
  'price_modifiers',
  'order_templates',
  'order_section_templates',
  'section_template_properties',
  'audit_logs',
  'migrations',
];

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'erp_production',
});

async function checkDatabase() {
  log.section('ПРОВЕРКА БАЗЫ ДАННЫХ ERP-СЕРВЕРА');

  try {
    // 1. Подключение к БД
    log.info('Подключение к базе данных...');
    await AppDataSource.initialize();
    log.success('Подключение установлено');

    // 2. Проверка версии PostgreSQL
    const versionResult = await AppDataSource.query('SELECT version()');
    const version = versionResult[0].version;
    log.info(`PostgreSQL: ${version.split(',')[0]}`);

    // 3. Информация о базе данных
    const dbInfo = await AppDataSource.query(`
      SELECT 
        pg_database.datname,
        pg_size_pretty(pg_database_size(pg_database.datname)) AS size
      FROM pg_database
      WHERE pg_database.datname = current_database()
    `);
    log.info(`База данных: ${dbInfo[0].datname} (${dbInfo[0].size})`);

    // 4. Список таблиц
    log.section('ТАБЛИЦЫ В БАЗЕ ДАННЫХ');
    const tables = await AppDataSource.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    if (tables.length === 0) {
      log.warning('Таблицы не найдены. Запустите миграции: npm run migration:run');
    } else {
      log.success(`Найдено таблиц: ${tables.length}`);
      
      console.log('\nСуществующие таблицы:');
      tables.forEach(table => {
        const isExpected = expectedTables.includes(table.tablename);
        const symbol = isExpected ? colors.green + '  ✓' : colors.yellow + '  ?';
        console.log(`${symbol} ${table.tablename}${colors.reset}`);
      });

      // Проверка отсутствующих таблиц
      const existingTableNames = tables.map(t => t.tablename);
      const missingTables = expectedTables.filter(t => !existingTableNames.includes(t));
      
      if (missingTables.length > 0) {
        log.warning(`Отсутствуют ожидаемые таблицы: ${missingTables.join(', ')}`);
      }
    }

    // 5. Статистика по таблицам
    log.section('СТАТИСТИКА ПО ТАБЛИЦАМ');
    
    const tableStats = await AppDataSource.query(`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
        (SELECT count(*) FROM pg_indexes WHERE tablename = t.tablename) as indexes
      FROM pg_tables t
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `);

    console.log('\n┌─────────────────────────────────┬───────────┬─────────┐');
    console.log('│ Таблица                         │ Размер    │ Индексы │');
    console.log('├─────────────────────────────────┼───────────┼─────────┤');
    
    for (const stat of tableStats) {
      const name = stat.tablename.padEnd(31);
      const size = stat.size.padEnd(9);
      const indexes = stat.indexes.toString().padEnd(7);
      console.log(`│ ${name} │ ${size} │ ${indexes} │`);
    }
    console.log('└─────────────────────────────────┴───────────┴─────────┘');

    // 6. Проверка данных в ключевых таблицах
    log.section('ДАННЫЕ В ТАБЛИЦАХ');

    const existingTableNames = tables.map(t => t.tablename);
    const dataTables = ['users', 'products', 'properties', 'order_templates', 'audit_logs'];
    
    for (const tableName of dataTables) {
      if (existingTableNames.includes(tableName)) {
        try {
          const countResult = await AppDataSource.query(`SELECT COUNT(*) as count FROM ${tableName}`);
          const count = parseInt(countResult[0].count);
          
          if (count > 0) {
            log.success(`${tableName}: ${count} записей`);
          } else {
            log.warning(`${tableName}: пусто (рекомендуется запустить seed: npm run seed)`);
          }
        } catch (error) {
          log.error(`${tableName}: ошибка чтения (${error.message})`);
        }
      }
    }

    // 7. Миграции
    log.section('МИГРАЦИИ');
    
    if (existingTableNames.includes('migrations')) {
      const migrations = await AppDataSource.query(`
        SELECT id, timestamp, name 
        FROM migrations 
        ORDER BY timestamp DESC
      `);

      if (migrations.length > 0) {
        log.success(`Выполнено миграций: ${migrations.length}`);
        console.log('\nПоследние миграции:');
        migrations.slice(0, 5).forEach(m => {
          console.log(`  ${colors.cyan}${m.timestamp}${colors.reset} - ${m.name}`);
        });
      } else {
        log.warning('Миграции не выполнены. Запустите: npm run migration:run');
      }
    } else {
      log.error('Таблица миграций не найдена');
    }

    // 8. Внешние ключи
    log.section('ВНЕШНИЕ КЛЮЧИ');
    
    const foreignKeys = await AppDataSource.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name
    `);

    log.success(`Найдено внешних ключей: ${foreignKeys.length}`);
    
    if (foreignKeys.length > 0) {
      console.log('\nНекоторые связи:');
      foreignKeys.slice(0, 10).forEach(fk => {
        console.log(`  ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
      if (foreignKeys.length > 10) {
        console.log(`  ... и еще ${foreignKeys.length - 10}`);
      }
    }

    // 9. Индексы
    log.section('ИНДЕКСЫ');
    
    const indexes = await AppDataSource.query(`
      SELECT
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);

    log.success(`Найдено индексов: ${indexes.length}`);

    // Итоговый отчет
    log.section('ИТОГОВЫЙ ОТЧЕТ');
    
    const checks = [
      { name: 'Подключение к БД', status: true },
      { name: 'Таблицы созданы', status: tables.length > 0 },
      { name: 'Миграции выполнены', status: existingTableNames.includes('migrations') },
      { name: 'Есть данные', status: dataTables.some(t => existingTableNames.includes(t)) },
      { name: 'Внешние ключи', status: foreignKeys.length > 0 },
      { name: 'Индексы', status: indexes.length > 0 },
    ];

    console.log('');
    checks.forEach(check => {
      if (check.status) {
        log.success(check.name);
      } else {
        log.error(check.name);
      }
    });

    const allPassed = checks.every(c => c.status);
    
    if (allPassed) {
      console.log(`\n${colors.green}╔════════════════════════════════════════════════════════════╗`);
      console.log(`║          ✅ БАЗА ДАННЫХ НАСТРОЕНА КОРРЕКТНО ✅             ║`);
      console.log(`╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);
    } else {
      console.log(`\n${colors.yellow}╔════════════════════════════════════════════════════════════╗`);
      console.log(`║       ⚠️  ТРЕБУЕТСЯ ДОПОЛНИТЕЛЬНАЯ НАСТРОЙКА              ║`);
      console.log(`╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);
      
      if (tables.length === 0) {
        log.info('Рекомендация: запустите миграции');
        console.log('  npm run migration:run');
      }
      
      if (!dataTables.some(t => existingTableNames.includes(t))) {
        log.info('Рекомендация: заполните начальными данными');
        console.log('  npm run seed');
      }
    }

  } catch (error) {
    log.error(`Ошибка: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Запуск проверки
checkDatabase().catch(error => {
  console.error('Критическая ошибка:', error);
  process.exit(1);
});

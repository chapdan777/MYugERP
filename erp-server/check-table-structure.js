// Скрипт для проверки структуры таблицы users через TypeORM
const { DataSource } = require('typeorm');
const { config } = require('./dist/database/data-source');

async function checkTableStructure() {
  console.log('Проверка структуры таблицы users...\n');
  
  const AppDataSource = new DataSource({
    ...config,
    entities: [__dirname + '/dist/modules/**/infrastructure/persistence/*.entity{.js}'],
    logging: ['query', 'error']
  });

  try {
    await AppDataSource.initialize();
    console.log('✅ Подключение установлено\n');
    
    // Выполняем raw SQL запрос для получения структуры таблицы
    const queryRunner = AppDataSource.createQueryRunner();
    const columns = await queryRunner.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('Колонки в таблице users:');
    console.table(columns);
    
    // Проверяем данные в таблице
    console.log('\nПервая запись в таблице users:');
    const user = await queryRunner.query('SELECT * FROM users LIMIT 1');
    console.log(JSON.stringify(user, null, 2));
    
    await queryRunner.release();
    await AppDataSource.destroy();
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error(error.stack);
  }
}

checkTableStructure();
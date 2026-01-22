const { DataSource } = require('typeorm');
const { config } = require('./dist/database/data-source');

async function addPhoneColumn() {
  console.log('Добавление колонки phone в таблицу users...\n');
  
  const AppDataSource = new DataSource({
    ...config,
    entities: [],
    logging: ['query', 'error']
  });

  try {
    await AppDataSource.initialize();
    console.log('✅ Подключение установлено\n');
    
    const queryRunner = AppDataSource.createQueryRunner();
    
    // Проверяем, существует ли колонка
    const columns = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'phone'
    `);
    
    if (columns.length > 0) {
      console.log('✅ Колонка phone уже существует');
    } else {
      console.log('➕ Добавляем колонку phone...');
      await queryRunner.query(`
        ALTER TABLE users ADD COLUMN phone character varying(50)
      `);
      console.log('✅ Колонка phone успешно добавлена');
    }
    
    await queryRunner.release();
    await AppDataSource.destroy();
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error(error.stack);
  }
}

addPhoneColumn();
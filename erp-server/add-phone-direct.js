const { Client } = require('pg');

async function addPhoneColumnDirect() {
  console.log('Подключение к базе данных...');
  
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'erp_production',
    user: 'postgres',
    password: 'postgres'
  });

  try {
    await client.connect();
    console.log('✅ Подключение установлено');
    
    // Проверяем, существует ли колонка
    const result = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'phone'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Колонка phone уже существует');
    } else {
      console.log('➕ Добавляем колонку phone...');
      await client.query(`
        ALTER TABLE users ADD COLUMN phone character varying(50)
      `);
      console.log('✅ Колонка phone успешно добавлена');
    }
    
    await client.end();
    console.log('✅ Подключение закрыто');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    if (client) {
      await client.end();
    }
  }
}

addPhoneColumnDirect();
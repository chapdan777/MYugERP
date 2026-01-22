const { Client } = require('pg');

async function checkUserStatus() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'myugerp_dev',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    await client.connect();
    
    // Проверим пользователя с username 'olga'
    const result = await client.query(`
      SELECT id, username, email, is_active, is_deleted 
      FROM users 
      WHERE username = 'olga'
    `);
    
    console.log('Пользователь с username "olga":');
    console.log(result.rows);
    
    // Проверим общее количество пользователей
    const countResult = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_active = true AND is_deleted = false) as active_users,
        COUNT(*) FILTER (WHERE is_active = false OR is_deleted = true) as inactive_or_deleted
      FROM users
    `);
    
    console.log('\nСтатистика пользователей:');
    console.log(countResult.rows[0]);
    
  } catch (error) {
    console.error('Ошибка подключения к БД:', error.message);
  } finally {
    await client.end();
  }
}

checkUserStatus();
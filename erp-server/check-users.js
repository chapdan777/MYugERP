const { DataSource } = require('typeorm');
const { config } = require('./dist/database/data-source');

async function checkUsers() {
  console.log('Подключение к базе данных...');
  
  const AppDataSource = new DataSource({
    ...config,
    entities: [__dirname + '/dist/modules/**/infrastructure/persistence/*.entity{.js}']
  });

  try {
    await AppDataSource.initialize();
    console.log('✅ Подключение установлено');
    
    // Проверяем таблицу users
    const userRepository = AppDataSource.getRepository('UserEntity');
    const users = await userRepository.find();
    
    console.log(`\nНайдено пользователей: ${users.length}`);
    console.log('Пользователи:', JSON.stringify(users, null, 2));
    
    // Проверяем конкретного пользователя
    const user = await userRepository.findOne({ where: { id: 1 } });
    console.log('\nПользователь с ID=1:', JSON.stringify(user, null, 2));
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error(error.stack);
  }
}

checkUsers();
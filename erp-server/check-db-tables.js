const { execSync } = require('child_process');

console.log('Проверка подключения к базе данных и наличия таблиц...\n');

try {
  // Проверяем наличие таблицы users
  const tablesResult = execSync(
    'psql -h localhost -U postgres -d myugerpd -c "\\dt users"',
    { encoding: 'utf8' }
  );
  
  console.log('Таблица users:');
  console.log(tablesResult);
  
  // Проверяем содержимое таблицы
  const dataResult = execSync(
    'psql -h localhost -U postgres -d myugerpd -c "SELECT COUNT(*) FROM users;"',
    { encoding: 'utf8' }
  );
  
  console.log('Количество записей в users:');
  console.log(dataResult);
  
  // Проверяем структуру таблицы
  const structureResult = execSync(
    'psql -h localhost -U postgres -d myugerpd -c "\\d users"',
    { encoding: 'utf8' }
  );
  
  console.log('Структура таблицы users:');
  console.log(structureResult);
  
} catch (error) {
  console.error('Ошибка при проверке базы данных:');
  console.error(error.message);
}
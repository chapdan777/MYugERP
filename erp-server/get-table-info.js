const { execSync } = require('child_process');

console.log('Получение структуры таблицы users через psql...\n');

try {
  // Используем psql для получения структуры таблицы
  const result = execSync(
    'psql -h localhost -U postgres -d erp_production -c "\\d users"',
    { encoding: 'utf8' }
  );
  
  console.log('Структура таблицы users:');
  console.log(result);
  
} catch (error) {
  console.error('Ошибка:', error.message);
}
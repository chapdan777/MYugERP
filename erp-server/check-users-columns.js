const { execSync } = require('child_process');

console.log('Проверка структуры таблицы users...\n');

try {
  // Получаем описание таблицы users
  const result = execSync(
    'curl -s -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3Njg0Njk5MTMsImV4cCI6MTc2ODQ3MDgxM30.VnOpJKnyyQ8cq6n2ZjNkciUfA0ysQM05KpXw8LiaJhQ" "http://localhost:3003/api/users" | jq .',
    { encoding: 'utf8' }
  );
  
  console.log('Ответ API /api/users:');
  console.log(result);
  
} catch (error) {
  console.error('Ошибка:', error.message);
}
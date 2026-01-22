// Простой тест для проверки маппинга пользователей
const { execSync } = require('child_process');

console.log('Проверка маппинга пользователей...\n');

// Проверим, какие роли есть в базе
try {
  const result = execSync(
    'curl -s -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3Njg0NjczODAsImV4cCI6MTc2ODQ2ODI4MH0._PgxNHEiOouBmZE__001axZwSKbstKP-NUV2RYpsSOU" http://localhost:3003/api/auth/me',
    { encoding: 'utf8' }
  );
  
  console.log('Текущий пользователь:');
  console.log(result);
  
  // Попробуем получить одного пользователя по ID
  const userResult = execSync(
    'curl -s -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3Njg0NjczODAsImV4cCI6MTc2ODQ2ODI4MH0._PgxNHEiOouBmZE__001axZwSKbstKP-NUV2RYpsSOU" http://localhost:3003/api/users/1',
    { encoding: 'utf8' }
  );
  
  console.log('\nПользователь по ID=1:');
  console.log(userResult);
  
} catch (error) {
  console.error('Ошибка при выполнении запросов:');
  console.error(error.message);
}
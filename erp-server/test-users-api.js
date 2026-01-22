const axios = require('axios');

async function testUsersEndpoint() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3Njg0NjczODAsImV4cCI6MTc2ODQ2ODI4MH0._PgxNHEiOouBmZE__001axZwSKbstKP-NUV2RYpsSOU';
  
  try {
    console.log('Выполняем запрос к /api/users...');
    const response = await axios.get('http://localhost:3003/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Успешный ответ:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Ошибка:');
    if (error.response) {
      console.log('Статус:', error.response.status);
      console.log('Данные:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Сообщение:', error.message);
    }
  }
}

testUsersEndpoint();
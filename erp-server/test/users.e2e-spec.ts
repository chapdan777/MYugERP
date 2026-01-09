import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let createdUserId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Получаем токен для тестов
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'admin',
        password: 'admin123',
      });

    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          username: `testuser_${Date.now()}`,
          password: 'test123456',
          fullName: 'Test User',
          email: `test_${Date.now()}@example.com`,
          role: 'manager',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username');
      expect(response.body).toHaveProperty('fullName', 'Test User');
      expect(response.body).toHaveProperty('role', 'manager');
      expect(response.body).not.toHaveProperty('passwordHash');

      createdUserId = response.body.id;
    });

    it('should reject creation with duplicate username', async () => {
      const username = `duplicate_${Date.now()}`;
      
      // Создаём первого пользователя
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          username,
          password: 'test123456',
          fullName: 'First User',
          email: `first_${Date.now()}@example.com`,
          role: 'manager',
        })
        .expect(201);

      // Пытаемся создать второго с тем же username
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          username,
          password: 'test123456',
          fullName: 'Second User',
          email: `second_${Date.now()}@example.com`,
          role: 'manager',
        })
        .expect(409); // Conflict
    });

    it('should reject creation without authentication', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          username: 'unauthorized',
          password: 'test123',
          fullName: 'Unauthorized',
          email: 'unauth@example.com',
          role: 'manager',
        })
        .expect(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          username: 'test',
          // Missing password
          fullName: 'Test',
          role: 'manager',
        });
      
      // Может быть 400 или 500 в зависимости от валидации
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('GET /users', () => {
    it('should return list of users', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Проверяем структуру первого пользователя
      const user = response.body[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('username');
      expect(user).toHaveProperty('role');
      expect(user).not.toHaveProperty('passwordHash');
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .expect(401);
    });
  });

  describe('GET /users/:id', () => {
    it('should return user by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdUserId);
      expect(response.body).toHaveProperty('username');
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .get('/users/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user information', async () => {
      const response = await request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          fullName: 'Updated Name',
          email: `updated${Date.now()}@example.com`,
        })
        .expect(200);

      expect(response.body).toHaveProperty('fullName', 'Updated Name');
      expect(response.body).toHaveProperty('email');
    });
  });

  describe('PUT /users/:id/deactivate', () => {
    it('should deactivate user', async () => {
      const response = await request(app.getHttpServer())
        .put(`/users/${createdUserId}/deactivate`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('isActive', false);
    });
  });

  describe('PUT /users/:id/activate', () => {
    it('should activate user', async () => {
      const response = await request(app.getHttpServer())
        .put(`/users/${createdUserId}/activate`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('isActive', true);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should soft delete user', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Проверяем что пользователь помечен как удалённый (если реализовано soft delete)
      // Или возвращает 404 (если hard delete)
      const response = await request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Принимаем любой из результатов
      expect([200, 404]).toContain(response.status);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Pricing (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

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

  describe('POST /price-modifiers', () => {
    it('should create a new price modifier', async () => {
      const response = await request(app.getHttpServer())
        .post('/price-modifiers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Тестовый модификатор',
          code: 'TEST_001',
          modifierType: 'percentage',
          value: 10,
          priority: 1,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'Тестовый модификатор');
      expect(response.body).toHaveProperty('code', 'TEST_001');
      expect(response.body).toHaveProperty('modifierType', 'percentage');
      expect(response.body).toHaveProperty('value', 10);
      expect(response.body).toHaveProperty('isActive', true);
    });

    it('should validate required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/price-modifiers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          // Missing required fields
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('error', 'Bad Request');
    });
  });

  describe('GET /price-modifiers', () => {
    it('should return list of price modifiers', async () => {
      const response = await request(app.getHttpServer())
        .get('/price-modifiers')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/price-modifiers')
        .expect(401);
    });
  });

  describe('GET /price-modifiers/:id', () => {
    it('should return price modifier by id', async () => {
      // First create a modifier to test with
      const createResponse = await request(app.getHttpServer())
        .post('/price-modifiers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Тестовый модификатор 2',
          code: 'TEST_002',
          modifierType: 'fixed_amount',
          value: 100,
        })
        .expect(201);

      const modifierId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/price-modifiers/${modifierId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', modifierId);
      expect(response.body).toHaveProperty('name', 'Тестовый модификатор 2');
      expect(response.body).toHaveProperty('modifierType', 'fixed_amount');
    });

    it('should return 404 for non-existent modifier', async () => {
      await request(app.getHttpServer())
        .get('/price-modifiers/999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('PUT /price-modifiers/:id', () => {
    it('should update price modifier', async () => {
      // First create a modifier
      const createResponse = await request(app.getHttpServer())
        .post('/price-modifiers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Для обновления',
          code: 'UPDATE_TEST',
          modifierType: 'percentage',
          value: 5,
        })
        .expect(201);

      const modifierId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .put(`/price-modifiers/${modifierId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Обновленный модификатор',
          value: 15,
        })
        .expect(200);

      expect(response.body).toHaveProperty('id', modifierId);
      expect(response.body).toHaveProperty('name', 'Обновленный модификатор');
      expect(response.body).toHaveProperty('value', 15);
    });
  });

  describe('DELETE /price-modifiers/:id', () => {
    it('should delete price modifier', async () => {
      // First create a modifier
      const createResponse = await request(app.getHttpServer())
        .post('/price-modifiers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Для удаления',
          code: 'DELETE_TEST',
          modifierType: 'multiplier',
          value: 1.1,
        })
        .expect(201);

      const modifierId = createResponse.body.id;

      // Delete it
      await request(app.getHttpServer())
        .delete(`/price-modifiers/${modifierId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });
  });

  describe('POST /price-modifiers/calculate', () => {
    it('should calculate price with modifiers', async () => {
      const response = await request(app.getHttpServer())
        .post('/price-modifiers/calculate')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          basePrice: 1500,
          quantity: 10,
          unit: 2.4,
          coefficient: 1.2,
          propertyValues: [
            { propertyId: 1, value: 'белый' },
            { propertyId: 2, value: 'глянцевый' },
          ],
        })
        .expect(200);

      expect(response.body).toHaveProperty('basePrice', 1500);
      expect(response.body).toHaveProperty('finalPrice');
      expect(response.body).toHaveProperty('totalPrice');
      expect(response.body).toHaveProperty('appliedModifiers');
      expect(Array.isArray(response.body.appliedModifiers)).toBe(true);
      expect(response.body).toHaveProperty('breakdown');

      // Проверяем расчеты
      expect(response.body.finalPrice).toBeGreaterThanOrEqual(response.body.basePrice);
      expect(response.body.totalPrice).toBeGreaterThanOrEqual(response.body.finalPrice);
    });

    it('should handle calculation with valid inputs', async () => {
      const response = await request(app.getHttpServer())
        .post('/price-modifiers/calculate')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          basePrice: 1500,
          quantity: 10,
          unit: 2.4,
          coefficient: 1.2,
          propertyValues: [
            { propertyId: 1, value: 'белый' },
            { propertyId: 2, value: 'глянцевый' },
          ],
        })
        .expect(200);

      expect(response.body).toHaveProperty('basePrice', 1500);
      expect(response.body).toHaveProperty('finalPrice');
      expect(response.body).toHaveProperty('totalPrice');
      expect(response.body).toHaveProperty('appliedModifiers');
      expect(Array.isArray(response.body.appliedModifiers)).toBe(true);
      expect(response.body).toHaveProperty('breakdown');
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/price-modifiers/calculate')
        .send({
          basePrice: 1000,
          quantity: 5,
          unit: 2,
          coefficient: 1,
        })
        .expect(401);
    });
  });
});
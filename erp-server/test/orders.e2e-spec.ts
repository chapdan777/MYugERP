import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Orders (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let createdOrderId: string;
  let createdClientId: string;
  let createdProductId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidUnknownValues: true }));
    await app.init();

    // Получаем токен для тестов
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'admin',
        password: 'admin123',
      });

    accessToken = loginResponse.body.accessToken;

    // Create a client and a product for testing
    const clientResponse = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        username: `client_${Date.now()}`,
        password: 'test123456',
        fullName: 'Test Client',
        email: `client_${Date.now()}@example.com`,
        role: 'client',
      });
    createdClientId = clientResponse.body.id;

    const productResponse = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: `Test Product ${Date.now()}`,
        code: `TP-${Date.now()}`,
        category: 'facades',
        unit: 'м2',
        basePrice: 1500.00,
      });
    createdProductId = productResponse.body.id;
  });

  afterAll(async () => {
    // Clean up created data
    if (createdOrderId) {
      await request(app.getHttpServer())
        .delete(`/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${accessToken}`);
    }
    if (createdProductId) {
      await request(app.getHttpServer())
        .delete(`/products/${createdProductId}`)
        .set('Authorization', `Bearer ${accessToken}`);
    }
    if (createdClientId) {
      await request(app.getHttpServer())
        .delete(`/users/${createdClientId}`)
        .set('Authorization', `Bearer ${accessToken}`);
    }
    await app.close();
  });

  describe('POST /orders', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .send({})
        .expect(401);
    });

    it('should fail with invalid data', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ nameOrder: 'Test' }) // Неполные данные
        .expect(400);
    });

    it('should create a new order with sections and items', async () => {
      const orderData = {
        typeOrder: 'standard',
        nameOrder: `E2E Test Order ${Date.now()}`,
        clientId: createdClientId,
        note: 'Test order created by e2e test',
        sections: [
          {
            sectionName: 'Test Section 1',
            items: [
              {
                productId: createdProductId,
                quantity: 2,
                length: 1000,
                width: 500,
              },
            ],
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('nameOrder', orderData.nameOrder);
      expect(response.body).toHaveProperty('sections');
      expect(response.body.sections).toHaveLength(1);
      expect(response.body.sections[0].items).toHaveLength(1);
      expect(response.body.sections[0].items[0]).toHaveProperty('productId', createdProductId);

      createdOrderId = response.body.id;
    });
  });

  describe('GET /orders/:id', () => {
    it('should require authentication', async () => {
        await request(app.getHttpServer())
            .get(`/orders/${createdOrderId}`)
            .expect(401);
    });

    it('should return 404 for non-existent order', async () => {
        const nonExistentId = '00000000-0000-0000-0000-000000000000';
        await request(app.getHttpServer())
            .get(`/orders/${nonExistentId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(404);
    });

    it('should return order by id', async () => {
      if (!createdOrderId) {
        console.warn('Skipping test - order was not created');
        return;
      }

      const response = await request(app.getHttpServer())
        .get(`/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdOrderId);
      expect(response.body).toHaveProperty('sections');
      expect(response.body.sections[0]).toHaveProperty('items');
    });
  });
});
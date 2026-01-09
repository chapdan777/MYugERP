import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Configuration (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let createdOrderTemplateId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidUnknownValues: true }));
    await app.init();

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

  describe('POST /order-templates', () => {
    it('should create a new order template', async () => {
      const orderTemplateData = {
        name: `Test Template ${Date.now()}`,
        orderType: 'standard',
      };

      const response = await request(app.getHttpServer())
        .post('/order-templates')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(orderTemplateData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      createdOrderTemplateId = response.body.id;
    });
  });

  describe('GET /order-templates/:id', () => {
    it('should return order template by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/order-templates/${createdOrderTemplateId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdOrderTemplateId);
    });
  });
});
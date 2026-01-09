import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Properties (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let createdPropertyId: string;

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

  describe('POST /properties', () => {
    it('should create a new property', async () => {
      const propertyData = {
        name: `Test Property ${Date.now()}`,
        type: 'string',
        description: 'A test property',
      };

      const response = await request(app.getHttpServer())
        .post('/properties')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(propertyData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', propertyData.name);
      createdPropertyId = response.body.id;
    });
  });

  describe('GET /properties/:id', () => {
    it('should return property by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/properties/${createdPropertyId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdPropertyId);
    });
  });
});
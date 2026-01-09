import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return API information object', () => {
      const expectedObject = {
        message: 'Production ERP API',
        version: '1.0',
        documentation: '/api/docs',
        endpoints: {
          auth: '/api/auth',
          users: '/api/users',
          products: '/api/products',
          properties: '/api/properties',
          pricing: '/api/price-modifiers',
          configuration: '/api/order-templates',
        },
      };
      expect(appController.getHello()).toEqual(expectedObject);
    });
  });
});

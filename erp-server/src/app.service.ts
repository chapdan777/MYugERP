import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
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
  }
}

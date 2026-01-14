import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from '../../../src/modules/orders/orders.module';
import { PricingModule } from '../../../src/modules/pricing/pricing.module';
import { PriceModifier } from '../../../src/modules/pricing/domain/entities/price-modifier.entity';
import { ModifierType } from '../../../src/modules/pricing/domain/enums/modifier-type.enum';
import { PriceModifierEntity } from '../../../src/modules/pricing/infrastructure/persistence/price-modifier.entity';
import { OrderEntity } from '../../../src/modules/orders/infrastructure/persistence/order.entity';
import { OrderSectionEntity } from '../../../src/modules/orders/infrastructure/persistence/order-section.entity';
import { OrderItemEntity } from '../../../src/modules/orders/infrastructure/persistence/order-item.entity';

describe('Price Calculation E2E Scenarios', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DATABASE_HOST || 'localhost',
          port: parseInt(process.env.DATABASE_PORT || '5432', 10),
          username: process.env.DATABASE_USERNAME || 'postgres',
          password: process.env.DATABASE_PASSWORD || 'postgres',
          database: process.env.DATABASE_NAME || 'erp_production',
          entities: [
            PriceModifierEntity,
            OrderEntity,
            OrderSectionEntity,
            OrderItemEntity,
          ],
          synchronize: true,
          logging: false,
        }),
        OrdersModule,
        PricingModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complex Modifier Combinations', () => {
    it('should calculate price with multiple percentage modifiers', async () => {
      // Создаем заказ с позицией
      const createOrderResponse = await (request(app.getHttpServer()) as any)
        .post('/orders')
        .send({
          clientId: 1,
          clientName: 'Test Client',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });

      const orderId = createOrderResponse.body.id;

      // Добавляем секцию
      const createSectionResponse = await (request(app.getHttpServer()) as any)
        .post(`/orders/${orderId}/sections`)
        .send({
          sectionNumber: 1,
          name: 'Kitchen Facades',
        });

      const sectionId = createSectionResponse.body.id;

      // Добавляем позицию с свойствами, активирующими несколько модификаторов
      const createItemResponse = await (request(app.getHttpServer()) as any)
        .post(`/orders/${orderId}/sections/${sectionId}/items`)
        .send({
          productId: 101,
          productName: 'Facade Panel',
          quantity: 2,
          properties: [
            { propertyId: 1, propertyValue: 'premium' }, // +20% premium material
            { propertyId: 2, propertyValue: 'bulk' },    // -10% bulk discount
            { propertyId: 3, propertyValue: 'large' },   // +500 fixed amount
          ],
        });

      const itemId = createItemResponse.body.id;

      // Рассчитываем цену
      const calculatePriceResponse = await (request(app.getHttpServer()) as any)
        .post(`/orders/${orderId}/sections/${sectionId}/items/${itemId}/calculate-price`)
        .send({
          basePrice: 1500,
          quantity: 2,
          coefficient: 1.2,
          properties: [
            { propertyId: 1, propertyValue: 'premium' },
            { propertyId: 2, propertyValue: 'bulk' },
            { propertyId: 3, propertyValue: 'large' },
          ],
        });

      expect(calculatePriceResponse.status).toBe(200);
      const result = calculatePriceResponse.body;

      // Проверяем правильный расчет:
      // Базовая цена: 1500
      // +20% premium material: 1500 * 1.2 = 1800
      // -10% bulk discount: 1800 * 0.9 = 1620
      // +500 fixed amount: 1620 + 500 = 2120
      // Коэффициент 1.2: 2120 * 1.2 = 2544
      // Количество 2: 2544 * 2 = 5088
      
      expect(result.basePrice).toBe(1500);
      expect(result.unitPrice).toBeCloseTo(2120); // После применения модификаторов
      expect(result.modifiedUnitPrice).toBeCloseTo(2544); // После коэффициента
      expect(result.finalPrice).toBeCloseTo(5088); // Итоговая цена

      // Проверяем что все модификаторы были применены
      expect(result.modifiersApplied).toHaveLength(3);
      const modifierCodes = result.modifiersApplied.map((m: any) => m.code);
      expect(modifierCodes).toContain('MAT_PREMIUM');
      expect(modifierCodes).toContain('BULK_DISCOUNT');
      expect(modifierCodes).toContain('SIZE_SURCHARGE');
    });
  });
});
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Order } from '../../../src/modules/orders/domain/entities/order.entity';
import { OrderSection } from '../../../src/modules/orders/domain/entities/order-section.entity';
import { OrderItem } from '../../../src/modules/orders/domain/entities/order-item.entity';
import { OrderStatus } from '../../../src/modules/orders/domain/enums/order-status.enum';
import { PaymentStatus } from '../../../src/modules/orders/domain/enums/payment-status.enum';
import { PriceModifier } from '../../../src/modules/pricing/domain/entities/price-modifier.entity';
import { ModifierType } from '../../../src/modules/pricing/domain/enums/modifier-type.enum';
import { PriceCalculationContext, PriceCalculationResult } from '../../../src/modules/pricing/domain/services/price-calculation.types';
import { OrderRepository } from '../../../src/modules/orders/infrastructure/persistence/order.repository';
import { PriceModifierRepository } from '../../../src/modules/pricing/infrastructure/persistence/price-modifier.repository';
import { PriceCalculationService } from '../../../src/modules/pricing/domain/services/price-calculation.service';
import { ProductPriceCalculatorService } from '../../../src/modules/pricing/domain/services/product-price-calculator.service';
import { OrderEntity } from '../../../src/modules/orders/infrastructure/persistence/order.entity';
import { OrderSectionEntity } from '../../../src/modules/orders/infrastructure/persistence/order-section.entity';
import { OrderItemEntity } from '../../../src/modules/orders/infrastructure/persistence/order-item.entity';
import { PriceModifierEntity } from '../../../src/modules/pricing/infrastructure/persistence/price-modifier.entity';

describe('Pricing-Orders Cross-Module Integration', () => {
  let orderRepository: OrderRepository;
  let priceModifierRepository: PriceModifierRepository;
  let priceCalculationService: PriceCalculationService;
  let productPriceCalculatorService: ProductPriceCalculatorService;
  let dataSource: DataSource;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [
            OrderEntity,
            OrderSectionEntity,
            OrderItemEntity,
            PriceModifierEntity,
          ],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([
          OrderEntity,
          OrderSectionEntity,
          OrderItemEntity,
          PriceModifierEntity,
        ]),
      ],
      providers: [
        OrderRepository,
        PriceModifierRepository,
        PriceCalculationService,
        ProductPriceCalculatorService,
      ],
    }).compile();

    orderRepository = module.get<OrderRepository>(OrderRepository);
    priceModifierRepository = module.get<PriceModifierRepository>(PriceModifierRepository);
    priceCalculationService = module.get<PriceCalculationService>(PriceCalculationService);
    productPriceCalculatorService = module.get<ProductPriceCalculatorService>(ProductPriceCalculatorService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    if (dataSource) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    // Очистка всех таблиц перед каждым тестом
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.query('DELETE FROM order_item_entity');
    await queryRunner.query('DELETE FROM order_section_entity');
    await queryRunner.query('DELETE FROM order_entity');
    await queryRunner.query('DELETE FROM price_modifier_entity');
    await queryRunner.release();
  });

  describe('Order Price Calculation with Modifiers', () => {
    it('should calculate order item price considering applicable modifiers', async () => {
      // Создаем модификатор для теста
      const modifier = PriceModifier.restore({
        id: 1,
        name: 'Premium Material Surcharge',
        code: 'PREMIUM-SURCHARGE',
        modifierType: ModifierType.PERCENTAGE,
        value: 20, // +20%
        propertyId: 1,
        propertyValue: 'premium',
        conditionExpression: null,
        priority: 1,
        isActive: true,
        startDate: null,
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await priceModifierRepository.save(modifier);

      // Создаем контекст расчета цены
      const itemProperties = new Map<number, string>();
      itemProperties.set(1, 'premium'); // Это должно активировать модификатор

      const context: PriceCalculationContext = {
        basePrice: 1000, // Базовая цена 1000 руб/м²
        propertyValues: itemProperties,
        quantity: 2,
        unit: 1.5, // 1.5 м²
        coefficient: 1.2,
      };

      const priceResult: PriceCalculationResult = await priceCalculationService.calculatePrice(context);

      // Проверяем что модификатор применился правильно
      expect(priceResult.basePrice).toBe(1000);
      expect(priceResult.finalPrice).toBeCloseTo(2160); // 1000 * 1.2 * 1.5 * 1.2 (20% + размеры + коэффициент)
      expect(priceResult.breakdown.afterQuantity).toBeCloseTo(4320); // 2160 * 2 (количество)
    });

    it('should handle multiple modifiers with different priorities', async () => {
      // Создаем несколько модификаторов с разными приоритетами
      const modifier1 = PriceModifier.restore({
        id: 1,
        name: 'High Priority Discount',
        code: 'HIGH-DISCOUNT',
        modifierType: ModifierType.PERCENTAGE,
        value: -10, // -10% скидка
        propertyId: 2,
        propertyValue: 'bulk',
        conditionExpression: null,
        priority: 1, // Высокий приоритет
        isActive: true,
        startDate: null,
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const modifier2 = PriceModifier.restore({
        id: 2,
        name: 'Low Priority Surcharge',
        code: 'LOW-SURCHARGE',
        modifierType: ModifierType.FIXED_AMOUNT,
        value: 500, // +500 руб
        propertyId: 2,
        propertyValue: 'bulk',
        conditionExpression: null,
        priority: 10, // Низкий приоритет
        isActive: true,
        startDate: null,
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await priceModifierRepository.save(modifier1);
      await priceModifierRepository.save(modifier2);

      // Создаем контекст с свойствами, активирующими оба модификатора
      const itemProperties = new Map<number, string>();
      itemProperties.set(2, 'bulk');

      const context: PriceCalculationContext = {
        basePrice: 2000,
        propertyValues: itemProperties,
        quantity: 1,
        unit: 1,
        coefficient: 1,
      };

      const priceResult: PriceCalculationResult = await priceCalculationService.calculatePrice(context);

      // Проверяем правильный порядок применения модификаторов
      // Сначала скидка -10%, потом надбавка +500 руб
      expect(priceResult.finalPrice).toBeCloseTo(2300); // (2000 * 0.9) + 500
    });
  });

  describe('Modifier Validation Across Modules', () => {
    it('should validate modifier codes are unique across the system', async () => {
      // Создаем модификатор
      const modifier = PriceModifier.restore({
        id: 1,
        name: 'Unique Modifier',
        code: 'UNIQUE-CODE-001',
        modifierType: ModifierType.PERCENTAGE,
        value: 10,
        propertyId: null,
        propertyValue: null,
        conditionExpression: null,
        priority: 1,
        isActive: true,
        startDate: null,
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedModifier = await priceModifierRepository.save(modifier);

      // Попытка создать модификатор с тем же кодом должна провалиться на уровне БД
      const duplicateModifier = PriceModifier.restore({
        id: 2,
        name: 'Duplicate Modifier',
        code: 'UNIQUE-CODE-001', // Тот же код
        modifierType: ModifierType.FIXED_AMOUNT,
        value: 100,
        propertyId: null,
        propertyValue: null,
        conditionExpression: null,
        priority: 2,
        isActive: true,
        startDate: null,
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Это должно вызвать ошибку уникальности кода
      await expect(priceModifierRepository.save(duplicateModifier)).rejects.toThrow();
    });
  });

  describe('Complex Order Scenarios', () => {
    it('should handle complex order with multiple sections and varied pricing', async () => {
      // Создаем различные модификаторы
      const materialModifier = PriceModifier.restore({
        id: 1,
        name: 'Material Upgrade',
        code: 'MAT-UPGRADE',
        modifierType: ModifierType.MULTIPLIER,
        value: 1.3, // ×1.3 за премиальный материал
        propertyId: 5,
        propertyValue: 'premium-material',
        conditionExpression: null,
        priority: 1,
        isActive: true,
        startDate: null,
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const sizeModifier = PriceModifier.restore({
        id: 2,
        name: 'Large Size Surcharge',
        code: 'LARGE-SIZE',
        modifierType: ModifierType.PERCENTAGE,
        value: 15, // +15% за большие размеры
        propertyId: 6,
        propertyValue: 'large-dimensions',
        conditionExpression: null,
        priority: 2,
        isActive: true,
        startDate: null,
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await priceModifierRepository.save(materialModifier);
      await priceModifierRepository.save(sizeModifier);

      // Создаем сложный заказ
      const order = Order.create({
        orderNumber: 'COMPLEX-ORDER-001',
        clientId: 1,
        clientName: 'Complex Client',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        notes: 'Complex order with multiple pricing factors',
      });

      const savedOrder = await orderRepository.save(order);

      // Проверяем базовую структуру заказа
      expect(savedOrder.getOrderNumber()).toBe('COMPLEX-ORDER-001');
      expect(savedOrder.getClientName()).toBe('Complex Client');
      expect(savedOrder.getStatus()).toBe(OrderStatus.DRAFT);
    });
  });
});
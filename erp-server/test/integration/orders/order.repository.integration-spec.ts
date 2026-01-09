import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IOrderRepository, ORDER_REPOSITORY } from '../../../src/modules/orders/domain/repositories/order.repository.interface';
import { Order } from '../../../src/modules/orders/domain/entities/order.entity';

import { OrderRepository } from '../../../src/modules/orders/infrastructure/persistence/order.repository';
import { OrderEntity } from '../../../src/modules/orders/infrastructure/persistence/order.entity';
import { OrderSectionEntity } from '../../../src/modules/orders/infrastructure/persistence/order-section.entity';
import { OrderItemEntity } from '../../../src/modules/orders/infrastructure/persistence/order-item.entity';

describe('OrderRepository (Integration)', () => {
  let orderRepository: IOrderRepository;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'test_user',
          password: 'test_password',
          database: 'test_db',
          entities: [OrderEntity, OrderSectionEntity, OrderItemEntity],
          synchronize: true,
          dropSchema: true,
        }),
        TypeOrmModule.forFeature([OrderEntity, OrderSectionEntity, OrderItemEntity]),
      ],
      providers: [
        {
          provide: ORDER_REPOSITORY,
          useClass: OrderRepository,
        },
      ],
    }).compile();

    orderRepository = module.get<IOrderRepository>(ORDER_REPOSITORY);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should save and find an order', async () => {
    const order = Order.create({
      orderNumber: 'TEST-001',
      clientId: 1,
      clientName: 'Test Client',
    });

    const savedOrder = await orderRepository.save(order);
    const foundOrder = await orderRepository.findById(savedOrder.getId()!);

    expect(foundOrder).toBeDefined();
    expect(foundOrder!.getId()).toBe(savedOrder.getId());
    expect(foundOrder!.getOrderNumber()).toBe('TEST-001');
  });
});
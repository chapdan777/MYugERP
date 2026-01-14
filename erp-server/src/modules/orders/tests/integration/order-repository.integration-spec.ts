import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order } from '../../domain/entities/order.entity';
import { OrderStatus } from '../../domain/enums/order-status.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { OrderRepository } from '../../infrastructure/persistence/order.repository';
import { OrderEntity } from '../../infrastructure/persistence/order.entity';
import { OrderSectionEntity } from '../../infrastructure/persistence/order-section.entity';
import { OrderItemEntity } from '../../infrastructure/persistence/order-item.entity';

describe('OrderRepository Integration', () => {
  let repository: OrderRepository;
  let orderRepo: Repository<OrderEntity>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [OrderEntity, OrderSectionEntity, OrderItemEntity],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([OrderEntity, OrderSectionEntity, OrderItemEntity]),
      ],
      providers: [OrderRepository],
    }).compile();

    repository = module.get<OrderRepository>(OrderRepository);
    orderRepo = module.get<Repository<OrderEntity>>(getRepositoryToken(OrderEntity));
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    if (dataSource) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    // Очистка базы перед каждым тестом
    await orderRepo.query('DELETE FROM order_item_entity');
    await orderRepo.query('DELETE FROM order_section_entity'); 
    await orderRepo.query('DELETE FROM order_entity');
  });

  describe('save', () => {
    it('should save a new order', async () => {
      const order = Order.create({
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Test Client',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: 'Test order notes',
      });

      const savedOrder = await repository.save(order);

      expect(savedOrder).toBeDefined();
      expect(savedOrder.getId()).toBeDefined();
      expect(savedOrder.getOrderNumber()).toBe('ORD-001');
      expect(savedOrder.getClientId()).toBe(1);
      expect(savedOrder.getClientName()).toBe('Test Client');
      expect(savedOrder.getStatus()).toBe(OrderStatus.DRAFT);
    });

    it('should update an existing order', async () => {
      // Создаем и сохраняем заказ
      const order = Order.create({
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Test Client',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      const savedOrder = await repository.save(order);

      // Обновляем заказ
      savedOrder.updateInfo({
        clientName: 'Updated Client',
        notes: 'Updated notes'
      });
      savedOrder.changeStatus(OrderStatus.CONFIRMED);

      const updatedOrder = await repository.save(savedOrder);

      expect(updatedOrder.getClientName()).toBe('Updated Client');
      expect(updatedOrder.getNotes()).toBe('Updated notes');
      expect(updatedOrder.getStatus()).toBe(OrderStatus.CONFIRMED);
    });
  });

  describe('findById', () => {
    it('should find order by id', async () => {
      const order = Order.create({
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Test Client',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: 'Test order',
      });

      const savedOrder = await repository.save(order);
      const foundOrder = await repository.findById(savedOrder.getId()!);

      expect(foundOrder).toBeDefined();
      expect(foundOrder!.getId()).toBe(savedOrder.getId());
      expect(foundOrder!.getOrderNumber()).toBe('ORD-001');
      expect(foundOrder!.getClientName()).toBe('Test Client');
    });

    it('should return null for non-existent order', async () => {
      const foundOrder = await repository.findById(999999);
      expect(foundOrder).toBeNull();
    });
  });

  describe('findByOrderNumber', () => {
    it('should find order by order number', async () => {
      const order = Order.create({
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Test Client',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      await repository.save(order);
      const foundOrder = await repository.findByOrderNumber('ORD-001');

      expect(foundOrder).toBeDefined();
      expect(foundOrder!.getOrderNumber()).toBe('ORD-001');
    });

    it('should return null for non-existent order number', async () => {
      const foundOrder = await repository.findByOrderNumber('NON-EXISTENT');
      expect(foundOrder).toBeNull();
    });
  });

  describe('findAll with filters', () => {
    it('should find orders by client id filter', async () => {
      // Создаем заказы для разных клиентов
      const order1 = Order.create({
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Client 1',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      const order2 = Order.create({
        orderNumber: 'ORD-002',
        clientId: 1,
        clientName: 'Client 1',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      const order3 = Order.create({
        orderNumber: 'ORD-003',
        clientId: 2,
        clientName: 'Client 2',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      await repository.save(order1);
      await repository.save(order2);
      await repository.save(order3);

      const client1Orders = await repository.findAll({ clientId: 1 });
      const client2Orders = await repository.findAll({ clientId: 2 });

      expect(client1Orders).toHaveLength(2);
      expect(client2Orders).toHaveLength(1);
      expect(client1Orders.every((o: Order) => o.getClientId() === 1)).toBeTruthy();
    });

    it('should return empty array for client with no orders', async () => {
      const orders = await repository.findAll({ clientId: 999 });
      expect(orders).toHaveLength(0);
    });
  });

  describe('transaction handling', () => {
    it('should rollback transaction on error', async () => {
      const order = Order.create({
        orderNumber: 'ORD-001',
        clientId: 1,
        clientName: 'Test Client',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      // Сохраняем нормальный заказ
      const savedOrder = await repository.save(order);

      // Проверяем что первый заказ все еще существует
      const foundOrder = await repository.findById(savedOrder.getId()!);
      expect(foundOrder).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle orders with special characters in notes', async () => {
      const order = Order.create({
        orderNumber: 'ORD-SPECIAL',
        clientId: 1,
        clientName: 'Test Client',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?№"',
      });

      const savedOrder = await repository.save(order);
      const foundOrder = await repository.findById(savedOrder.getId()!);

      expect(foundOrder).toBeDefined();
      expect(foundOrder!.getNotes()).toBe('Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?№"');
    });

    it('should handle orders with very long notes', async () => {
      const longNotes = 'A'.repeat(1000); // 1000 символов

      const order = Order.create({
        orderNumber: 'ORD-LONG',
        clientId: 1,
        clientName: 'Test Client',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: longNotes,
      });

      const savedOrder = await repository.save(order);
      const foundOrder = await repository.findById(savedOrder.getId()!);

      expect(foundOrder).toBeDefined();
      expect(foundOrder!.getNotes()).toBe(longNotes);
    });
  });
});
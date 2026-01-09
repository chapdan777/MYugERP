import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderRepository } from '../../../src/modules/orders/infrastructure/persistence/order.repository';
import { IOrderRepository } from '../../../src/modules/orders/domain/repositories/order.repository.interface';
import { Order } from '../../../src/modules/orders/domain/entities/order.entity';
import { OrderEntity } from '../../../src/modules/orders/infrastructure/persistence/order.entity';
import { OrderMapper } from '../../../src/modules/orders/infrastructure/mappers/order.mapper';

describe('OrderRepository (Unit)', () => {
  let orderRepository: IOrderRepository;
  let mockOrderRepository: jest.Mocked<Repository<OrderEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderRepository,
        {
          provide: getRepositoryToken(OrderEntity),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    orderRepository = module.get<OrderRepository>(OrderRepository);
    mockOrderRepository = module.get(getRepositoryToken(OrderEntity));
  });

  describe('save', () => {
    it('should save an order and return the saved entity', async () => {
      const order = Order.create({
        orderNumber: 'TEST-001',
        clientId: 1,
        clientName: 'Test Client',
      });

      const orderEntity = new OrderEntity();
      orderEntity.id = 1;
      orderEntity.orderNumber = 'TEST-001';
      
      const savedEntity = new OrderEntity();
      savedEntity.id = 1;
      savedEntity.orderNumber = 'TEST-001';

      jest.spyOn(OrderMapper, 'toPersistence').mockReturnValue(orderEntity);
      jest.spyOn(mockOrderRepository, 'save').mockResolvedValue(savedEntity);
      jest.spyOn(OrderMapper, 'toDomain').mockReturnValue(order);

      const result = await orderRepository.save(order);

      expect(OrderMapper.toPersistence).toHaveBeenCalledWith(order);
      expect(mockOrderRepository.save).toHaveBeenCalledWith(orderEntity);
      expect(OrderMapper.toDomain).toHaveBeenCalledWith(savedEntity);
      expect(result).toBe(order);
    });
  });

  describe('findById', () => {
    it('should find an order by id and return it', async () => {
      const orderEntity = new OrderEntity();
      orderEntity.id = 1;
      orderEntity.orderNumber = 'TEST-001';

      const order = Order.create({
        orderNumber: 'TEST-001',
        clientId: 1,
        clientName: 'Test Client',
      });

      jest.spyOn(mockOrderRepository, 'findOne').mockResolvedValue(orderEntity);
      jest.spyOn(OrderMapper, 'toDomain').mockReturnValue(order);

      const result = await orderRepository.findById(1);

      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['sections', 'sections.items'],
      });
      expect(OrderMapper.toDomain).toHaveBeenCalledWith(orderEntity);
      expect(result).toBe(order);
    });

    it('should return null if order is not found', async () => {
      jest.spyOn(mockOrderRepository, 'findOne').mockResolvedValue(null);

      const result = await orderRepository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByOrderNumber', () => {
    it('should find an order by order number and return it', async () => {
      const orderEntity = new OrderEntity();
      orderEntity.id = 1;
      orderEntity.orderNumber = 'TEST-001';

      const order = Order.create({
        orderNumber: 'TEST-001',
        clientId: 1,
        clientName: 'Test Client',
      });

      jest.spyOn(mockOrderRepository, 'findOne').mockResolvedValue(orderEntity);
      jest.spyOn(OrderMapper, 'toDomain').mockReturnValue(order);

      const result = await orderRepository.findByOrderNumber('TEST-001');

      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: { orderNumber: 'TEST-001' },
        relations: ['sections', 'sections.items'],
      });
      expect(result).toBe(order);
    });
  });

  describe('existsByOrderNumber', () => {
    it('should return true if order number exists', async () => {
      jest.spyOn(mockOrderRepository, 'count').mockResolvedValue(1);

      const result = await orderRepository.existsByOrderNumber('TEST-001');

      expect(mockOrderRepository.count).toHaveBeenCalledWith({
        where: { orderNumber: 'TEST-001' },
      });
      expect(result).toBe(true);
    });

    it('should return false if order number does not exist', async () => {
      jest.spyOn(mockOrderRepository, 'count').mockResolvedValue(0);

      const result = await orderRepository.existsByOrderNumber('TEST-001');

      expect(result).toBe(false);
    });
  });
});
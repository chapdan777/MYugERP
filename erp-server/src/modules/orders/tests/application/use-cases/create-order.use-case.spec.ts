import { CreateOrderUseCase } from '../../../application/use-cases/create-order.use-case';
import { IOrderRepository, ORDER_REPOSITORY } from '../../../domain/repositories/order.repository.interface';
import { Order } from '../../../domain/entities/order.entity';
import { Test, TestingModule } from '@nestjs/testing';

describe('CreateOrderUseCase', () => {
  let createOrderUseCase: CreateOrderUseCase;
  let orderRepository: IOrderRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateOrderUseCase,
        {
          provide: ORDER_REPOSITORY,
          useValue: {
            save: jest.fn().mockImplementation((order: Order) => Promise.resolve(order)),
            generateOrderNumber: jest.fn().mockResolvedValue('TEST-001'),
            findById: jest.fn(),
            findAll: jest.fn(),
            delete: jest.fn(),
            findByOrderNumber: jest.fn(),
            existsByOrderNumber: jest.fn(),
          },
        },
      ],
    }).compile();

    createOrderUseCase = module.get<CreateOrderUseCase>(CreateOrderUseCase);
    orderRepository = module.get<IOrderRepository>(ORDER_REPOSITORY);
  });

  it('should create a new order', async () => {
    const order = await createOrderUseCase.execute({
      clientId: 1,
      clientName: 'Test Client',
    });

    expect(order).toBeDefined();
    expect(order.getOrderNumber()).toBe('TEST-001');
    expect(orderRepository.save).toHaveBeenCalled();
  });
});
import { CopyOrderUseCase } from '../../../application/use-cases/copy-order.use-case';
import { IOrderRepository, ORDER_REPOSITORY } from '../../../domain/repositories/order.repository.interface';
import { Order } from '../../../domain/entities/order.entity';
import { Test, TestingModule } from '@nestjs/testing';

describe('CopyOrderUseCase', () => {
  let copyOrderUseCase: CopyOrderUseCase;
  let orderRepository: IOrderRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CopyOrderUseCase,
        {
          provide: ORDER_REPOSITORY,
          useValue: {
            save: jest.fn().mockImplementation((order: Order) => Promise.resolve(order)),
            findById: jest.fn(),
            findAll: jest.fn(),
            delete: jest.fn(),
            findByOrderNumber: jest.fn(),
            existsByOrderNumber: jest.fn(),
            generateOrderNumber: jest.fn().mockResolvedValue('COPY-001'),
          },
        },
      ],
    }).compile();

    copyOrderUseCase = module.get<CopyOrderUseCase>(CopyOrderUseCase);
    orderRepository = module.get<IOrderRepository>(ORDER_REPOSITORY);
  });

  it('should copy order successfully', async () => {
    const originalOrder = Order.create({
      orderNumber: 'TEST-001',
      clientId: 1,
      clientName: 'Test Client'
    });
    
    // Мокаем методы для клонирования
    (originalOrder as any).clone = jest.fn().mockReturnValue(
      Order.create({
        orderNumber: 'COPY-001',
        clientId: 1,
        clientName: 'Test Client'
      })
    );
    
    (orderRepository.findById as jest.Mock).mockResolvedValue(originalOrder);

    const result = await copyOrderUseCase.execute({
      sourceOrderId: 1,
      newClientId: 2,
      newClientName: 'New Client'
    });

    expect(result).toBeDefined();
    expect(result.getOrderNumber()).toBe('COPY-001');
    expect(orderRepository.save).toHaveBeenCalled();
  });

  it('should throw error when order not found', async () => {
    (orderRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      copyOrderUseCase.execute({
        sourceOrderId: 999,
        newClientId: 2,
        newClientName: 'New Client'
      })
    ).rejects.toThrow('Source order with ID 999 not found');
  });
});
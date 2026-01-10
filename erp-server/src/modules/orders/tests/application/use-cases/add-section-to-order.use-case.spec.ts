import { AddSectionToOrderUseCase } from '../../../application/use-cases/add-section-to-order.use-case';
import { IOrderRepository, ORDER_REPOSITORY } from '../../../domain/repositories/order.repository.interface';
import { Order } from '../../../domain/entities/order.entity';
import { OrderSection } from '../../../domain/entities/order-section.entity';
import { Test, TestingModule } from '@nestjs/testing';

describe('AddSectionToOrderUseCase', () => {
  let addSectionToOrderUseCase: AddSectionToOrderUseCase;
  let orderRepository: IOrderRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddSectionToOrderUseCase,
        {
          provide: ORDER_REPOSITORY,
          useValue: {
            save: jest.fn().mockImplementation((order: Order) => Promise.resolve(order)),
            findById: jest.fn(),
            findAll: jest.fn(),
            delete: jest.fn(),
            findByOrderNumber: jest.fn(),
            existsByOrderNumber: jest.fn(),
            generateOrderNumber: jest.fn(),
          },
        },
      ],
    }).compile();

    addSectionToOrderUseCase = module.get<AddSectionToOrderUseCase>(AddSectionToOrderUseCase);
    orderRepository = module.get<IOrderRepository>(ORDER_REPOSITORY);
  });

  it('should add section to order successfully', async () => {
    const mockOrder = Order.create({
      orderNumber: 'TEST-001',
      clientId: 1,
      clientName: 'Test Client'
    });
    
    (mockOrder as any).addSection = jest.fn();
    (mockOrder as any).canBeModified = jest.fn().mockReturnValue(true);
    
    (orderRepository.findById as jest.Mock).mockResolvedValue(mockOrder);

    const result = await addSectionToOrderUseCase.execute({
      orderId: 1,
      sectionNumber: 1,
      name: 'Test Section'
    });

    expect(result).toBeDefined();
    expect(mockOrder.addSection).toHaveBeenCalled();
    expect(orderRepository.save).toHaveBeenCalled();
  });

  it('should throw error when order not found', async () => {
    (orderRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      addSectionToOrderUseCase.execute({
        orderId: 999,
        sectionNumber: 1,
        name: 'Test Section'
      })
    ).rejects.toThrow('Order with ID 999 not found');
  });

  it('should throw error when order cannot be modified', async () => {
    const mockOrder = Order.create({
      orderNumber: 'TEST-001',
      clientId: 1,
      clientName: 'Test Client'
    });
    
    (mockOrder as any).canBeModified = jest.fn().mockReturnValue(false);
    (orderRepository.findById as jest.Mock).mockResolvedValue(mockOrder);

    await expect(
      addSectionToOrderUseCase.execute({
        orderId: 1,
        sectionNumber: 1,
        name: 'Test Section'
      })
    ).rejects.toThrow('Cannot add section to order in status');
  });
});
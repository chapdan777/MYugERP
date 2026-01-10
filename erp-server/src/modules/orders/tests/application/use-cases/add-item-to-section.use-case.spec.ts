import { AddItemToSectionUseCase } from '../../../application/use-cases/add-item-to-section.use-case';
import { IOrderRepository, ORDER_REPOSITORY } from '../../../domain/repositories/order.repository.interface';
import { Order } from '../../../domain/entities/order.entity';
import { OrderSection } from '../../../domain/entities/order-section.entity';
import { OrderItem } from '../../../domain/entities/order-item.entity';
import { Test, TestingModule } from '@nestjs/testing';

describe('AddItemToSectionUseCase', () => {
  let addItemToSectionUseCase: AddItemToSectionUseCase;
  let orderRepository: IOrderRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddItemToSectionUseCase,
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

    addItemToSectionUseCase = module.get<AddItemToSectionUseCase>(AddItemToSectionUseCase);
    orderRepository = module.get<IOrderRepository>(ORDER_REPOSITORY);
  });

  it('should add item to section successfully', async () => {
    // Создаем mock заказ с секцией
    const mockOrder = Order.create({
      orderNumber: 'TEST-001',
      clientId: 1,
      clientName: 'Test Client'
    });
    
    // Мокаем метод getSectionByNumber
    const mockSection = {
      getId: () => 1,
      getSectionNumber: () => 1,
      addItem: jest.fn(),
      getItems: () => []  // Для проверки бизнес-правил
    };
    
    (mockOrder as any).getSectionByNumber = jest.fn().mockReturnValue(mockSection);
    (mockOrder as any).calculateTotalAmount = jest.fn();
    
    (orderRepository.findById as jest.Mock).mockResolvedValue(mockOrder);

    const result = await addItemToSectionUseCase.execute({
      orderId: 1,
      sectionNumber: 1,
      productId: 1,
      productName: 'Test Product',
      quantity: 2,
      unit: 1,
      basePrice: 1500,
    });

    expect(result).toBeDefined();
    expect(mockSection.addItem).toHaveBeenCalled();
    expect(orderRepository.save).toHaveBeenCalled();
  });

  it('should throw error when order not found', async () => {
    (orderRepository.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      addItemToSectionUseCase.execute({
        orderId: 999,
        sectionNumber: 1,
        productId: 1,
        productName: 'Test Product',
        quantity: 1,
        unit: 1,
        basePrice: 1500,
      })
    ).rejects.toThrow('Order with ID 999 not found');
  });

  it('should throw error when section not found', async () => {
    const mockOrder = Order.create({
      orderNumber: 'TEST-001',
      clientId: 1,
      clientName: 'Test Client'
    });
    
    (mockOrder as any).getSectionByNumber = jest.fn().mockReturnValue(null);
    (orderRepository.findById as jest.Mock).mockResolvedValue(mockOrder);

    await expect(
      addItemToSectionUseCase.execute({
        orderId: 1,
        sectionNumber: 999,
        productId: 1,
        productName: 'Test Product',
        quantity: 1,
        unit: 1,
        basePrice: 1500,
      })
    ).rejects.toThrow('Section 999 not found in order 1');
  });
});
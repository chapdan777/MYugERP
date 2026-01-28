import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Order } from '../../domain/entities/order.entity';
import { IOrderRepository, ORDER_REPOSITORY } from '../../domain/repositories/order.repository.interface';
import { CalculatePriceUseCase } from '../../../pricing/application/use-cases/calculate-price.use-case';

export interface RecalculateItemPriceDto {
  orderId: number;
  sectionNumber: number;
  itemId: number;
}

/**
 * Use case: Recalculate prices for an order item based on current properties
 * This is triggered when item properties change that affect pricing
 */
@Injectable()
export class RecalculateItemPriceUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    private readonly calculatePriceUseCase: CalculatePriceUseCase,
  ) { }

  async execute(dto: RecalculateItemPriceDto): Promise<Order> {
    // 1. Fetch the order
    const order = await this.orderRepository.findById(dto.orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${dto.orderId} not found`);
    }

    // 2. Find the section
    const section = order.getSectionByNumber(dto.sectionNumber);
    if (!section) {
      throw new NotFoundException(
        `Section ${dto.sectionNumber} not found in order ${dto.orderId}`,
      );
    }

    // 3. Find the item
    const item = section.getItems().find(i => i.getId() === dto.itemId);
    if (!item) {
      throw new NotFoundException(
        `Item ${dto.itemId} not found in section ${dto.sectionNumber}`,
      );
    }

    // 4. Build property values map for price calculation
    const propertyValues = item.getProperties().map(p => ({
      propertyId: p.getPropertyId(),
      propertyValue: p.getValue()
    }));

    // 5. Calculate new price using CalculatePriceUseCase
    const result = await this.calculatePriceUseCase.execute({
      basePrice: item.getBasePrice(),
      quantity: item.getQuantity(),
      unitType: 'unit', // TODO: Add unit mapping
      propertyValues,
      coefficient: item.getCoefficient(),
      productId: item.getProductId(), // Using public getter
    });

    // 6. Update item prices
    item.updatePrices(result.finalPrice / item.getQuantity(), result.finalPrice);

    // 7. Recalculate order total
    order.calculateTotalAmount();

    // 8. Save order
    const savedOrder = await this.orderRepository.save(order);

    return savedOrder;
  }
}

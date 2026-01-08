import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Order } from '../../domain/entities/order.entity';
import { IOrderRepository, ORDER_REPOSITORY } from '../../domain/repositories/order.repository.interface';

export interface RemoveItemFromSectionDto {
  orderId: number;
  sectionNumber: number;
  itemId: number;
}

/**
 * Use case: Remove an item from an order section
 */
@Injectable()
export class RemoveItemFromSectionUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(dto: RemoveItemFromSectionDto): Promise<Order> {
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

    // 3. Remove item from section
    section.removeItem(dto.itemId);

    // 4. Recalculate order total
    order.calculateTotalAmount();

    // 5. Save order
    const savedOrder = await this.orderRepository.save(order);

    return savedOrder;
  }
}

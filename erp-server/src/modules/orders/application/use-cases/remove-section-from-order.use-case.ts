import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Order } from '../../domain/entities/order.entity';
import { IOrderRepository, ORDER_REPOSITORY } from '../../domain/repositories/order.repository.interface';

export interface RemoveSectionFromOrderDto {
  orderId: number;
  sectionNumber: number;
}

/**
 * Use case: Remove a section from an order
 */
@Injectable()
export class RemoveSectionFromOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(dto: RemoveSectionFromOrderDto): Promise<Order> {
    // 1. Fetch the order
    const order = await this.orderRepository.findById(dto.orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${dto.orderId} not found`);
    }

    // 2. Remove section (includes validation)
    order.removeSection(dto.sectionNumber);

    // 3. Save order
    const savedOrder = await this.orderRepository.save(order);

    return savedOrder;
  }
}

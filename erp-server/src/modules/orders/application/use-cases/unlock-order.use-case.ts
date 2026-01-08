import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Order } from '../../domain/entities/order.entity';
import { IOrderRepository, ORDER_REPOSITORY } from '../../domain/repositories/order.repository.interface';

export interface UnlockOrderDto {
  orderId: number;
  userId: number;
}

/**
 * Use case: Unlock an order
 * Releases the soft lock so others can edit
 */
@Injectable()
export class UnlockOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(dto: UnlockOrderDto): Promise<Order> {
    // 1. Fetch the order
    const order = await this.orderRepository.findById(dto.orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${dto.orderId} not found`);
    }

    // 2. Unlock the order (includes validation)
    order.unlock(dto.userId);

    // 3. Save order
    const savedOrder = await this.orderRepository.save(order);

    return savedOrder;
  }
}

import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Order } from '../../domain/entities/order.entity';
import { IOrderRepository, ORDER_REPOSITORY } from '../../domain/repositories/order.repository.interface';

export interface LockOrderDto {
  orderId: number;
  userId: number;
}

/**
 * Use case: Lock an order for editing by a user
 * Implements soft locking to prevent concurrent modifications
 */
@Injectable()
export class LockOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(dto: LockOrderDto): Promise<Order> {
    // 1. Fetch the order
    const order = await this.orderRepository.findById(dto.orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${dto.orderId} not found`);
    }

    // 2. Lock the order (includes business rule validation)
    order.lock(dto.userId);

    // 3. Save order
    const savedOrder = await this.orderRepository.save(order);

    return savedOrder;
  }
}

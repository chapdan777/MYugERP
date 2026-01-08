import { Injectable, Inject } from '@nestjs/common';
import { Order } from '../../domain/entities/order.entity';
import { IOrderRepository, ORDER_REPOSITORY } from '../../domain/repositories/order.repository.interface';
import { OrderDeadlineMustBeFutureRule } from '../../domain/specifications/order-business-rules';

export interface CreateOrderDto {
  clientId: number;
  clientName: string;
  deadline?: Date;
  notes?: string;
}

/**
 * Use case: Create an empty order without template
 * Creates a new order that can be populated with sections and items manually
 */
@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(dto: CreateOrderDto): Promise<Order> {
    // 1. Validate deadline if provided
    if (dto.deadline) {
      OrderDeadlineMustBeFutureRule.assertSatisfied(dto.deadline);
    }

    // 2. Generate order number
    const orderNumber = await this.orderRepository.generateOrderNumber();

    // 3. Create the order
    const order = Order.create({
      orderNumber,
      clientId: dto.clientId,
      clientName: dto.clientName,
      deadline: dto.deadline ?? null,
      notes: dto.notes ?? null,
    });

    // 4. Save the order
    const savedOrder = await this.orderRepository.save(order);

    return savedOrder;
  }
}

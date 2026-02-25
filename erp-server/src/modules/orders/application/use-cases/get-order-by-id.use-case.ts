import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IOrderRepository, ORDER_REPOSITORY } from '../../domain/repositories/order.repository.interface';
import { Order } from '../../domain/entities/order.entity';

@Injectable()
export class GetOrderByIdUseCase {
    constructor(
        @Inject(ORDER_REPOSITORY)
        private readonly orderRepository: IOrderRepository,
    ) { }

    async execute(id: number): Promise<Order> {
        const order = await this.orderRepository.findById(id);
        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }
        return order;
    }
}

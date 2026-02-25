import { Injectable, Inject } from '@nestjs/common';
import { IOrderRepository, ORDER_REPOSITORY } from '../../domain/repositories/order.repository.interface';
import { Order } from '../../domain/entities/order.entity';

@Injectable()
export class GetOrdersUseCase {
    constructor(
        @Inject(ORDER_REPOSITORY)
        private readonly orderRepository: IOrderRepository,
    ) { }

    async execute(): Promise<Order[]> {
        return this.orderRepository.findAll();
    }
}

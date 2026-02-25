import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IOrderRepository, ORDER_REPOSITORY } from '../../domain/repositories/order.repository.interface';

@Injectable()
export class DeleteOrderUseCase {
    constructor(
        @Inject(ORDER_REPOSITORY)
        private readonly orderRepository: IOrderRepository,
    ) { }

    async execute(id: number): Promise<void> {
        const order = await this.orderRepository.findById(id);
        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }
        await this.orderRepository.delete(id);
    }
}

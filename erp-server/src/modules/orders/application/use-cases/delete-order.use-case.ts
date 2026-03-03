import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IOrderRepository, ORDER_REPOSITORY } from '../../domain/repositories/order.repository.interface';
import { OrderDeletedEvent } from '../../domain/events/order-deleted.event';

@Injectable()
export class DeleteOrderUseCase {
    constructor(
        @Inject(ORDER_REPOSITORY)
        private readonly orderRepository: IOrderRepository,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async execute(id: number): Promise<void> {
        const order = await this.orderRepository.findById(id);
        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }
        await this.orderRepository.delete(id);

        // Опубликовать событие об удалении заказа для других модулей (например, WorkOrders)
        this.eventEmitter.emit('order.deleted', new OrderDeletedEvent(id));
    }
}

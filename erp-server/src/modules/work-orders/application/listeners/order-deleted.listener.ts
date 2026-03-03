import { Injectable, Inject, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderDeletedEvent } from '../../../orders/domain/events/order-deleted.event';
import { IWorkOrderRepository, WORK_ORDER_REPOSITORY } from '../../domain/repositories/work-order.repository.interface';

@Injectable()
export class OrderDeletedListener {
    private readonly logger = new Logger(OrderDeletedListener.name);

    constructor(
        @Inject(WORK_ORDER_REPOSITORY)
        private readonly workOrderRepository: IWorkOrderRepository,
    ) { }

    @OnEvent('order.deleted')
    async handleOrderDeletedEvent(event: OrderDeletedEvent) {
        this.logger.log(`Received order.deleted event for orderId: ${event.orderId}. Deleting cascade work orders...`);
        try {
            await this.workOrderRepository.deleteByOrderId(event.orderId);
            this.logger.log(`Successfully deleted work orders for orderId: ${event.orderId}`);
        } catch (error) {
            this.logger.error(`Failed to delete work orders for orderId: ${event.orderId}`, error);
        }
    }
}

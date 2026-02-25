import { OrderItemComponent } from '../entities/order-item-component.entity';

export const ORDER_ITEM_COMPONENT_REPOSITORY = 'ORDER_ITEM_COMPONENT_REPOSITORY';

export interface IOrderItemComponentRepository {
    save(component: OrderItemComponent): Promise<OrderItemComponent>;
    findByOrderItemId(orderItemId: number): Promise<OrderItemComponent[]>;
    deleteByOrderItemId(orderItemId: number): Promise<void>;
}

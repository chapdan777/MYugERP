import { Order } from '../entities/order.entity';

/**
 * Repository interface for Order aggregate
 */
export abstract class IOrderRepository {
  abstract save(order: Order): Promise<Order>;
  abstract findById(id: number): Promise<Order | null>;
  abstract findByOrderNumber(orderNumber: string): Promise<Order | null>;
  abstract existsByOrderNumber(orderNumber: string): Promise<boolean>;
  abstract findAll(filters?: {
    clientId?: number;
    status?: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<Order[]>;
  abstract delete(id: number): Promise<void>;
  abstract generateOrderNumber(): Promise<string>;
}

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');

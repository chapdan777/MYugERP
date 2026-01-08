import { OrderLog } from '../entities/order-log.entity';

/**
 * Repository interface for OrderLog
 */
export abstract class IOrderLogRepository {
  abstract save(log: OrderLog): Promise<OrderLog>;
  abstract findByOrderId(orderId: number): Promise<OrderLog[]>;
  abstract findByOrderIdAndAction(
    orderId: number,
    action: string,
  ): Promise<OrderLog[]>;
  abstract findRecent(orderId: number, limit: number): Promise<OrderLog[]>;
}

export const ORDER_LOG_REPOSITORY = Symbol('ORDER_LOG_REPOSITORY');

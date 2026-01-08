import { OrderPaymentAllocation } from '../entities/order-payment-allocation.entity';

export const ORDER_PAYMENT_ALLOCATION_REPOSITORY = Symbol(
  'ORDER_PAYMENT_ALLOCATION_REPOSITORY',
);

export abstract class IOrderPaymentAllocationRepository {
  abstract save(
    allocation: OrderPaymentAllocation,
  ): Promise<OrderPaymentAllocation>;
  abstract findById(id: number): Promise<OrderPaymentAllocation | null>;
  abstract findByOrderId(orderId: number): Promise<OrderPaymentAllocation[]>;
  abstract findActiveByOrderId(
    orderId: number,
  ): Promise<OrderPaymentAllocation[]>;
  abstract findByClientId(clientId: number): Promise<OrderPaymentAllocation[]>;
  abstract findActiveByClientId(
    clientId: number,
  ): Promise<OrderPaymentAllocation[]>;
  abstract getTotalAllocatedForOrder(orderId: number): Promise<number>;
  abstract getTotalAllocatedForClient(clientId: number): Promise<number>;
  abstract delete(id: number): Promise<void>;
}

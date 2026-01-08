import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PaymentAllocatedEvent } from '../../domain/events/payment-allocated.event';
import { PaymentAllocationCancelledEvent } from '../../domain/events/payment-allocation-cancelled.event';
import {
  IOrderPaymentAllocationRepository,
  ORDER_PAYMENT_ALLOCATION_REPOSITORY,
} from '../../domain/repositories/order-payment-allocation.repository.interface';
import {
  IOrderRepository,
  ORDER_REPOSITORY,
} from '../../../orders/domain/repositories/order.repository.interface';
import { PaymentStatus } from '../../../orders/domain/enums/payment-status.enum';

/**
 * Event Handler for Payment Allocation Events
 * 
 * Automatically updates Order payment status when allocations change
 * Task 5.10: Order payment status updates
 */
@Injectable()
export class PaymentAllocationEventsHandler {
  constructor(
    @Inject(ORDER_PAYMENT_ALLOCATION_REPOSITORY)
    private readonly allocationRepository: IOrderPaymentAllocationRepository,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  @OnEvent('payment.allocated')
  async handlePaymentAllocated(event: PaymentAllocatedEvent): Promise<void> {
    try {
      await this.updateOrderPaymentStatus(event.orderId);

      console.log(
        `[PaymentAllocationEventsHandler] Order payment status updated for order ${event.orderId}. Allocated: ${event.allocatedAmount}`,
      );
    } catch (error) {
      console.error(
        `[PaymentAllocationEventsHandler] Error updating order payment status:`,
        error,
      );
      throw error;
    }
  }

  @OnEvent('payment.allocation.cancelled')
  async handlePaymentAllocationCancelled(
    event: PaymentAllocationCancelledEvent,
  ): Promise<void> {
    try {
      await this.updateOrderPaymentStatus(event.orderId);

      console.log(
        `[PaymentAllocationEventsHandler] Order payment status updated after cancellation for order ${event.orderId}. Reversed: ${event.allocatedAmount}`,
      );
    } catch (error) {
      console.error(
        `[PaymentAllocationEventsHandler] Error updating order payment status after cancellation:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Update order payment status based on total allocated amount
   */
  private async updateOrderPaymentStatus(orderId: number): Promise<void> {
    // Get order
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      console.warn(
        `[PaymentAllocationEventsHandler] Order ${orderId} not found`,
      );
      return;
    }

    // Get total allocated amount
    const totalAllocated =
      await this.allocationRepository.getTotalAllocatedForOrder(orderId);

    // Get order total amount
    const orderTotal = order.getTotalAmount();

    // Determine payment status
    let newPaymentStatus: PaymentStatus;

    if (totalAllocated === 0) {
      newPaymentStatus = PaymentStatus.UNPAID;
    } else if (totalAllocated >= orderTotal) {
      newPaymentStatus = PaymentStatus.PAID;
    } else {
      newPaymentStatus = PaymentStatus.PARTIALLY_PAID;
    }

    // Update if status changed
    if (order.getPaymentStatus() !== newPaymentStatus) {
      order.updatePaymentStatus(newPaymentStatus);
      await this.orderRepository.save(order);

      console.log(
        `[PaymentAllocationEventsHandler] Order ${orderId} payment status changed to ${newPaymentStatus}. Allocated: ${totalAllocated} / ${orderTotal}`,
      );
    }
  }
}

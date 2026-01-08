import { DomainEvent } from './domain-event.base';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

/**
 * Event fired when a new order is created
 */
export class OrderCreatedEvent extends DomainEvent {
  constructor(
    public readonly orderId: number,
    public readonly orderNumber: string,
    public readonly clientId: number,
    public readonly clientName: string,
    public readonly totalAmount: number,
    public readonly deadline: Date | null,
  ) {
    super();
  }

  getEventName(): string {
    return 'order.created';
  }
}

/**
 * Event fired when an order status changes
 */
export class OrderStatusChangedEvent extends DomainEvent {
  constructor(
    public readonly orderId: number,
    public readonly orderNumber: string,
    public readonly previousStatus: OrderStatus,
    public readonly newStatus: OrderStatus,
    public readonly changedBy: number | null,
  ) {
    super();
  }

  getEventName(): string {
    return 'order.status_changed';
  }
}

/**
 * Event fired when order payment status changes
 */
export class OrderPaymentStatusChangedEvent extends DomainEvent {
  constructor(
    public readonly orderId: number,
    public readonly orderNumber: string,
    public readonly previousPaymentStatus: PaymentStatus,
    public readonly newPaymentStatus: PaymentStatus,
    public readonly totalAmount: number,
  ) {
    super();
  }

  getEventName(): string {
    return 'order.payment_status_changed';
  }
}

/**
 * Event fired when an order is locked for editing
 */
export class OrderLockedEvent extends DomainEvent {
  constructor(
    public readonly orderId: number,
    public readonly orderNumber: string,
    public readonly lockedBy: number,
    public readonly lockedAt: Date,
  ) {
    super();
  }

  getEventName(): string {
    return 'order.locked';
  }
}

/**
 * Event fired when an order is unlocked
 */
export class OrderUnlockedEvent extends DomainEvent {
  constructor(
    public readonly orderId: number,
    public readonly orderNumber: string,
    public readonly unlockedBy: number,
  ) {
    super();
  }

  getEventName(): string {
    return 'order.unlocked';
  }
}

/**
 * Event fired when a section is added to an order
 */
export class OrderSectionAddedEvent extends DomainEvent {
  constructor(
    public readonly orderId: number,
    public readonly orderNumber: string,
    public readonly sectionNumber: number,
    public readonly sectionName: string,
  ) {
    super();
  }

  getEventName(): string {
    return 'order.section_added';
  }
}

/**
 * Event fired when a section is removed from an order
 */
export class OrderSectionRemovedEvent extends DomainEvent {
  constructor(
    public readonly orderId: number,
    public readonly orderNumber: string,
    public readonly sectionNumber: number,
  ) {
    super();
  }

  getEventName(): string {
    return 'order.section_removed';
  }
}

/**
 * Event fired when an item is added to an order section
 */
export class OrderItemAddedEvent extends DomainEvent {
  constructor(
    public readonly orderId: number,
    public readonly orderNumber: string,
    public readonly sectionNumber: number,
    public readonly itemId: number,
    public readonly productId: number,
    public readonly productName: string,
    public readonly quantity: number,
    public readonly totalPrice: number,
  ) {
    super();
  }

  getEventName(): string {
    return 'order.item_added';
  }
}

/**
 * Event fired when an item is removed from an order section
 */
export class OrderItemRemovedEvent extends DomainEvent {
  constructor(
    public readonly orderId: number,
    public readonly orderNumber: string,
    public readonly sectionNumber: number,
    public readonly itemId: number,
  ) {
    super();
  }

  getEventName(): string {
    return 'order.item_removed';
  }
}

/**
 * Event fired when order total amount is recalculated
 */
export class OrderTotalRecalculatedEvent extends DomainEvent {
  constructor(
    public readonly orderId: number,
    public readonly orderNumber: string,
    public readonly previousTotal: number,
    public readonly newTotal: number,
  ) {
    super();
  }

  getEventName(): string {
    return 'order.total_recalculated';
  }
}

/**
 * Event fired when an order is updated
 */
export class OrderUpdatedEvent extends DomainEvent {
  constructor(
    public readonly orderId: number,
    public readonly orderNumber: string,
    public readonly updatedFields: string[],
  ) {
    super();
  }

  getEventName(): string {
    return 'order.updated';
  }
}

/**
 * Event fired when an order is deleted/cancelled
 */
export class OrderCancelledEvent extends DomainEvent {
  constructor(
    public readonly orderId: number,
    public readonly orderNumber: string,
    public readonly cancelledBy: number,
    public readonly reason: string | null,
  ) {
    super();
  }

  getEventName(): string {
    return 'order.cancelled';
  }
}

/**
 * Event fired when an order is confirmed and ready for production
 */
export class OrderConfirmedEvent extends DomainEvent {
  constructor(
    public readonly orderId: number,
    public readonly orderNumber: string,
    public readonly confirmedBy: number,
    public readonly deadline: Date | null,
  ) {
    super();
  }

  getEventName(): string {
    return 'order.confirmed';
  }
}

/**
 * Event fired when an order enters production
 */
export class OrderInProductionEvent extends DomainEvent {
  constructor(
    public readonly orderId: number,
    public readonly orderNumber: string,
    public readonly startedAt: Date,
  ) {
    super();
  }

  getEventName(): string {
    return 'order.in_production';
  }
}

/**
 * Event fired when an order is ready for delivery
 */
export class OrderReadyEvent extends DomainEvent {
  constructor(
    public readonly orderId: number,
    public readonly orderNumber: string,
    public readonly completedAt: Date,
  ) {
    super();
  }

  getEventName(): string {
    return 'order.ready';
  }
}

/**
 * Event fired when an order is delivered to the client
 */
export class OrderDeliveredEvent extends DomainEvent {
  constructor(
    public readonly orderId: number,
    public readonly orderNumber: string,
    public readonly deliveredAt: Date,
    public readonly deliveredBy: number,
  ) {
    super();
  }

  getEventName(): string {
    return 'order.delivered';
  }
}

import { Order } from '../entities/order.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { DomainException } from '../../../../common/exceptions/domain.exception';

/**
 * Business Rules and Specifications for Order Aggregate
 * Encapsulates domain business logic and invariants
 */

/**
 * Rule: Order can only be modified in DRAFT or CONFIRMED status
 */
export class OrderCanBeModifiedRule {
  static isSatisfiedBy(order: Order): boolean {
    return order.canBeModified();
  }

  static assertSatisfied(order: Order): void {
    if (!this.isSatisfiedBy(order)) {
      throw new DomainException(
        `Order cannot be modified in status: ${order.getStatus()}`,
      );
    }
  }
}

/**
 * Rule: Order must have at least one section before confirmation
 */
export class OrderMustHaveSectionsRule {
  static isSatisfiedBy(order: Order): boolean {
    return order.getSections().length > 0;
  }

  static assertSatisfied(order: Order): void {
    if (!this.isSatisfiedBy(order)) {
      throw new DomainException(
        'Order must have at least one section before confirmation',
      );
    }
  }
}

/**
 * Rule: Order total amount must be greater than zero before confirmation
 */
export class OrderMustHavePositiveTotalRule {
  static isSatisfiedBy(order: Order): boolean {
    return order.getTotalAmount() > 0;
  }

  static assertSatisfied(order: Order): void {
    if (!this.isSatisfiedBy(order)) {
      throw new DomainException(
        'Order must have a positive total amount before confirmation',
      );
    }
  }
}

/**
 * Rule: Cannot delete order that is in production or delivered
 */
export class OrderCanBeDeletedRule {
  static isSatisfiedBy(order: Order): boolean {
    const status = order.getStatus();
    return (
      status !== OrderStatus.IN_PRODUCTION &&
      status !== OrderStatus.READY &&
      status !== OrderStatus.DELIVERED
    );
  }

  static assertSatisfied(order: Order): void {
    if (!this.isSatisfiedBy(order)) {
      throw new DomainException(
        `Cannot delete order in status: ${order.getStatus()}`,
      );
    }
  }
}

/**
 * Rule: Order can only be locked if not already locked by another user
 */
export class OrderCanBeLockedRule {
  static isSatisfiedBy(order: Order, userId: number): boolean {
    if (!order.isLocked()) {
      return true;
    }
    return order.isLockedBy(userId);
  }

  static assertSatisfied(order: Order, userId: number): void {
    if (!this.isSatisfiedBy(order, userId)) {
      throw new DomainException(
        `Order is already locked by user ${order.getLockedBy()}`,
      );
    }
  }
}

/**
 * Rule: Order lock expires after 30 minutes of inactivity
 */
export class OrderLockExpirationRule {
  private static readonly LOCK_DURATION_MINUTES = 30;

  static isExpired(order: Order): boolean {
    const lockedAt = order.getLockedAt();
    if (!lockedAt) {
      return false;
    }

    const now = new Date();
    const diffMinutes = (now.getTime() - lockedAt.getTime()) / (1000 * 60);
    return diffMinutes > this.LOCK_DURATION_MINUTES;
  }

  static canAutoUnlock(order: Order): boolean {
    return order.isLocked() && this.isExpired(order);
  }
}

/**
 * Rule: Order status transitions must follow allowed paths
 */
export class OrderStatusTransitionRule {
  private static readonly VALID_TRANSITIONS: Record<
    OrderStatus,
    OrderStatus[]
  > = {
    [OrderStatus.DRAFT]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [
      OrderStatus.IN_PRODUCTION,
      OrderStatus.CANCELLED,
    ],
    [OrderStatus.IN_PRODUCTION]: [OrderStatus.READY, OrderStatus.CANCELLED],
    [OrderStatus.READY]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
  };

  static isSatisfiedBy(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): boolean {
    if (currentStatus === newStatus) {
      return true;
    }

    const allowedStatuses = this.VALID_TRANSITIONS[currentStatus];
    return allowedStatuses.includes(newStatus);
  }

  static assertSatisfied(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): void {
    if (!this.isSatisfiedBy(currentStatus, newStatus)) {
      throw new DomainException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  static getAllowedTransitions(currentStatus: OrderStatus): OrderStatus[] {
    return this.VALID_TRANSITIONS[currentStatus] || [];
  }
}

/**
 * Rule: Order deadline must be in the future for new orders
 */
export class OrderDeadlineMustBeFutureRule {
  static isSatisfiedBy(deadline: Date | null): boolean {
    if (!deadline) {
      return true; // No deadline is allowed
    }

    const now = new Date();
    return deadline > now;
  }

  static assertSatisfied(deadline: Date | null): void {
    if (!this.isSatisfiedBy(deadline)) {
      throw new DomainException('Order deadline must be in the future');
    }
  }
}

/**
 * Rule: Section numbers within an order must be unique
 */
export class SectionNumberUniquenessRule {
  static isSatisfiedBy(order: Order, sectionNumber: number): boolean {
    const sections = order.getSections();
    return !sections.some(s => s.getSectionNumber() === sectionNumber);
  }

  static assertSatisfied(order: Order, sectionNumber: number): void {
    if (!this.isSatisfiedBy(order, sectionNumber)) {
      throw new DomainException(
        `Section number ${sectionNumber} already exists in the order`,
      );
    }
  }
}

/**
 * Rule: Order can transition to IN_PRODUCTION only if all sections have items
 */
export class OrderReadyForProductionRule {
  static isSatisfiedBy(order: Order): boolean {
    const sections = order.getSections();
    
    if (sections.length === 0) {
      return false;
    }

    // All sections must have at least one item
    return sections.every(section => section.getItems().length > 0);
  }

  static assertSatisfied(order: Order): void {
    if (!this.isSatisfiedBy(order)) {
      throw new DomainException(
        'All sections must have at least one item before starting production',
      );
    }
  }
}

/**
 * Composite rule to validate order before confirmation
 */
export class OrderConfirmationRule {
  static validate(order: Order): void {
    OrderMustHaveSectionsRule.assertSatisfied(order);
    OrderMustHavePositiveTotalRule.assertSatisfied(order);
    OrderReadyForProductionRule.assertSatisfied(order);
  }
}

/**
 * Rule: Maximum number of sections per order
 */
export class MaxSectionsPerOrderRule {
  private static readonly MAX_SECTIONS = 50;

  static isSatisfiedBy(order: Order): boolean {
    return order.getSections().length < this.MAX_SECTIONS;
  }

  static assertSatisfied(order: Order): void {
    if (!this.isSatisfiedBy(order)) {
      throw new DomainException(
        `Order cannot have more than ${this.MAX_SECTIONS} sections`,
      );
    }
  }
}

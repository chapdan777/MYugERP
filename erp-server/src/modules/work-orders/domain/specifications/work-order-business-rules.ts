import { DomainException } from '../../../../common/exceptions/domain.exception';
import { WorkOrder } from '../entities/work-order.entity';
import { WorkOrderStatus } from '../enums/work-order-status.enum';

/**
 * Business rules for WorkOrder entity
 */

/**
 * Work order can be modified only in PLANNED status
 */
export class WorkOrderCanBeModifiedRule {
  static isSatisfiedBy(workOrder: WorkOrder): boolean {
    return workOrder.getStatus() === WorkOrderStatus.PLANNED;
  }

  static assertSatisfied(workOrder: WorkOrder): void {
    if (!this.isSatisfiedBy(workOrder)) {
      throw new DomainException(
        `Work order cannot be modified in status: ${workOrder.getStatus()}. ` +
        `Only PLANNED work orders can be modified.`,
      );
    }
  }
}

/**
 * Work order must have at least one item before assignment
 */
export class WorkOrderMustHaveItemsRule {
  static isSatisfiedBy(workOrder: WorkOrder): boolean {
    return workOrder.getItems().length > 0;
  }

  static assertSatisfied(workOrder: WorkOrder): void {
    if (!this.isSatisfiedBy(workOrder)) {
      throw new DomainException('Work order must have at least one item before assignment');
    }
  }
}

/**
 * Work order cannot be cancelled if already completed
 */
export class WorkOrderCanBeCancelledRule {
  static isSatisfiedBy(workOrder: WorkOrder): boolean {
    return workOrder.getStatus() !== WorkOrderStatus.COMPLETED;
  }

  static assertSatisfied(workOrder: WorkOrder): void {
    if (!this.isSatisfiedBy(workOrder)) {
      throw new DomainException('Cannot cancel completed work order');
    }
  }
}

/**
 * Priority must be within valid range (1-10)
 */
export class WorkOrderPriorityRangeRule {
  static readonly MIN_PRIORITY = 1;
  static readonly MAX_PRIORITY = 10;

  static isSatisfiedBy(priority: number): boolean {
    return priority >= this.MIN_PRIORITY && priority <= this.MAX_PRIORITY;
  }

  static assertSatisfied(priority: number): void {
    if (!this.isSatisfiedBy(priority)) {
      throw new DomainException(
        `Priority must be between ${this.MIN_PRIORITY} and ${this.MAX_PRIORITY}`,
      );
    }
  }
}

/**
 * Priority override requires a reason
 */
export class WorkOrderPriorityOverrideRequiresReasonRule {
  static isSatisfiedBy(reason: string | null | undefined): boolean {
    return !!reason && reason.trim().length > 0;
  }

  static assertSatisfied(reason: string | null | undefined): void {
    if (!this.isSatisfiedBy(reason)) {
      throw new DomainException('Priority override requires a reason');
    }
  }
}

/**
 * Work order deadline should not be in the past when created
 */
export class WorkOrderDeadlineRule {
  static isSatisfiedBy(deadline: Date | null): boolean {
    if (!deadline) return true; // null deadline is allowed
    return deadline >= new Date();
  }

  static assertSatisfied(deadline: Date | null): void {
    if (!this.isSatisfiedBy(deadline)) {
      throw new DomainException('Work order deadline cannot be in the past');
    }
  }

  /**
   * Check if work order is overdue
   */
  static isOverdue(workOrder: WorkOrder): boolean {
    const deadline = workOrder.getDeadline();
    if (!deadline) return false;
    if (workOrder.isCompleted()) return false;
    return new Date() > deadline;
  }
}

/**
 * Work order can only start if assigned
 */
export class WorkOrderCanStartRule {
  static isSatisfiedBy(workOrder: WorkOrder): boolean {
    return workOrder.getStatus() === WorkOrderStatus.ASSIGNED;
  }

  static assertSatisfied(workOrder: WorkOrder): void {
    if (!this.isSatisfiedBy(workOrder)) {
      throw new DomainException(
        `Cannot start work order in status: ${workOrder.getStatus()}. ` +
        `Work order must be ASSIGNED first.`,
      );
    }
  }
}

/**
 * Work order can be sent to quality check only if in progress
 */
export class WorkOrderCanSendToQualityCheckRule {
  static isSatisfiedBy(workOrder: WorkOrder): boolean {
    return workOrder.getStatus() === WorkOrderStatus.IN_PROGRESS;
  }

  static assertSatisfied(workOrder: WorkOrder): void {
    if (!this.isSatisfiedBy(workOrder)) {
      throw new DomainException(
        `Cannot send to quality check from status: ${workOrder.getStatus()}. ` +
        `Work order must be IN_PROGRESS.`,
      );
    }
  }
}

/**
 * Work order can be completed only after quality check
 */
export class WorkOrderCanCompleteRule {
  static isSatisfiedBy(workOrder: WorkOrder): boolean {
    return workOrder.getStatus() === WorkOrderStatus.QUALITY_CHECK;
  }

  static assertSatisfied(workOrder: WorkOrder): void {
    if (!this.isSatisfiedBy(workOrder)) {
      throw new DomainException(
        `Cannot complete work order in status: ${workOrder.getStatus()}. ` +
        `Work order must pass QUALITY_CHECK first.`,
      );
    }
  }
}

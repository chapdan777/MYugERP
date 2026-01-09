import { DomainException } from '../../../../common/exceptions/domain.exception';
import { WorkOrderStatus } from '../enums/work-order-status.enum';

/**
 * WorkOrderStatusTransitionRule
 * 
 * Defines valid state transitions for work orders following the workflow:
 * PLANNED → ASSIGNED → IN_PROGRESS → QUALITY_CHECK → COMPLETED
 * 
 * Any status can transition to CANCELLED (except COMPLETED)
 */
export class WorkOrderStatusTransitionRule {
  private static readonly VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
    [WorkOrderStatus.PLANNED]: [
      WorkOrderStatus.ASSIGNED,
      WorkOrderStatus.CANCELLED,
    ],
    [WorkOrderStatus.ASSIGNED]: [
      WorkOrderStatus.IN_PROGRESS,
      WorkOrderStatus.CANCELLED,
    ],
    [WorkOrderStatus.IN_PROGRESS]: [
      WorkOrderStatus.QUALITY_CHECK,
      WorkOrderStatus.CANCELLED,
    ],
    [WorkOrderStatus.QUALITY_CHECK]: [
      WorkOrderStatus.COMPLETED,
      WorkOrderStatus.IN_PROGRESS, // Can go back if quality check fails
      WorkOrderStatus.CANCELLED,
    ],
    [WorkOrderStatus.COMPLETED]: [],
    [WorkOrderStatus.CANCELLED]: [],
  };

  /**
   * Check if transition is valid
   */
  static isSatisfiedBy(currentStatus: WorkOrderStatus, newStatus: WorkOrderStatus): boolean {
    const allowedTransitions = this.VALID_TRANSITIONS[currentStatus];
    return allowedTransitions.includes(newStatus);
  }

  /**
   * Assert transition is valid or throw exception
   */
  static assertSatisfied(currentStatus: WorkOrderStatus, newStatus: WorkOrderStatus): void {
    if (!this.isSatisfiedBy(currentStatus, newStatus)) {
      throw new DomainException(
        `Invalid status transition from ${currentStatus} to ${newStatus}. ` +
        `Allowed transitions: ${this.VALID_TRANSITIONS[currentStatus].join(', ')}`,
      );
    }
  }

  /**
   * Get all allowed transitions from current status
   */
  static getAllowedTransitions(currentStatus: WorkOrderStatus): WorkOrderStatus[] {
    return [...this.VALID_TRANSITIONS[currentStatus]];
  }

  /**
   * Check if status is terminal (no further transitions allowed)
   */
  static isTerminalStatus(status: WorkOrderStatus): boolean {
    return this.VALID_TRANSITIONS[status].length === 0;
  }
}

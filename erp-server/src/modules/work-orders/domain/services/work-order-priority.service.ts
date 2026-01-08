import { Injectable } from '@nestjs/common';
import { WorkOrder } from '../entities/work-order.entity';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import {
  WorkOrderPriorityRangeRule,
  WorkOrderPriorityOverrideRequiresReasonRule,
} from '../specifications/work-order-business-rules';

/**
 * Priority override request with reason
 */
export interface PriorityOverrideRequest {
  workOrderId: number;
  newPriority: number;
  reason: string;
  requestedBy: number; // User ID requesting override
}

/**
 * Priority enforcement result
 */
export interface PriorityEnforcementResult {
  isAllowed: boolean;
  reason: string;
  requiresApproval: boolean;
  approvalLevel?: 'manager' | 'director' | 'admin';
}

/**
 * WorkOrderPriorityService - Domain Service
 * 
 * Manages work order priorities including:
 * - Priority validation and enforcement
 * - Priority override with approval workflow
 * - Priority blocking (preventing lower priority work orders from starting)
 * - Priority conflict resolution
 * 
 * Business Rules:
 * - Priority must be 1-10 (1=lowest, 10=highest/urgent)
 * - Priority overrides require justification
 * - Higher priority work orders should be processed first
 * - Priority blocks can prevent work on lower priority items
 */
@Injectable()
export class WorkOrderPriorityService {
  /**
   * Validate priority override request
   */
  validatePriorityOverride(
    workOrder: WorkOrder,
    request: PriorityOverrideRequest,
  ): PriorityEnforcementResult {
    // Validate priority range
    try {
      WorkOrderPriorityRangeRule.assertSatisfied(request.newPriority);
    } catch (error) {
      return {
        isAllowed: false,
        reason: 'Invalid priority value',
        requiresApproval: false,
      };
    }

    // Validate reason provided
    try {
      WorkOrderPriorityOverrideRequiresReasonRule.assertSatisfied(request.reason);
    } catch (error) {
      return {
        isAllowed: false,
        reason: 'Priority override requires a reason',
        requiresApproval: false,
      };
    }

    const currentPriority = workOrder.getEffectivePriority();
    const priorityChange = request.newPriority - currentPriority;

    // Small changes (±1) can be done without approval
    if (Math.abs(priorityChange) <= 1) {
      return {
        isAllowed: true,
        reason: 'Minor priority adjustment',
        requiresApproval: false,
      };
    }

    // Medium changes (±2-3) require manager approval
    if (Math.abs(priorityChange) <= 3) {
      return {
        isAllowed: true,
        reason: 'Medium priority change requires manager approval',
        requiresApproval: true,
        approvalLevel: 'manager',
      };
    }

    // Large changes (±4-5) require director approval
    if (Math.abs(priorityChange) <= 5) {
      return {
        isAllowed: true,
        reason: 'Large priority change requires director approval',
        requiresApproval: true,
        approvalLevel: 'director',
      };
    }

    // Extreme changes (>5) require admin approval
    return {
      isAllowed: true,
      reason: 'Extreme priority change requires admin approval',
      requiresApproval: true,
      approvalLevel: 'admin',
    };
  }

  /**
   * Apply priority override to work order
   */
  applyPriorityOverride(
    workOrder: WorkOrder,
    request: PriorityOverrideRequest,
  ): void {
    const validation = this.validatePriorityOverride(workOrder, request);

    if (!validation.isAllowed) {
      throw new DomainException(validation.reason);
    }

    if (validation.requiresApproval) {
      // In real implementation, this would check if approval was granted
      // For now, we'll allow it but log that approval was required
      console.warn(
        `Priority override requires ${validation.approvalLevel} approval: ${request.reason}`,
      );
    }

    workOrder.overridePriority(request.newPriority, request.reason);
  }

  /**
   * Check if a work order should be blocked by higher priority items
   * 
   * Priority blocking logic:
   * - If there are work orders with priority 3+ levels higher, block this one
   * - Used to ensure critical work is completed first
   */
  shouldBlockByPriority(
    workOrder: WorkOrder,
    otherWorkOrders: WorkOrder[],
  ): {
    shouldBlock: boolean;
    blockingWorkOrders: WorkOrder[];
    reason: string;
  } {
    const currentPriority = workOrder.getEffectivePriority();
    const PRIORITY_BLOCK_THRESHOLD = 3;

    // Find work orders with significantly higher priority
    const blockingWorkOrders = otherWorkOrders.filter(other => {
      // Only consider work orders for same department and operation
      if (other.getDepartmentId() !== workOrder.getDepartmentId()) {
        return false;
      }

      // Only block if other is in ASSIGNED or IN_PROGRESS status
      const status = other.getStatus();
      if (status !== 'ASSIGNED' && status !== 'IN_PROGRESS') {
        return false;
      }

      // Check if priority difference exceeds threshold
      const otherPriority = other.getEffectivePriority();
      return otherPriority - currentPriority >= PRIORITY_BLOCK_THRESHOLD;
    });

    if (blockingWorkOrders.length > 0) {
      const highestPriority = Math.max(
        ...blockingWorkOrders.map(wo => wo.getEffectivePriority()),
      );

      return {
        shouldBlock: true,
        blockingWorkOrders,
        reason: `Blocked by ${blockingWorkOrders.length} higher priority work order(s) ` +
                `(priority ${highestPriority} vs ${currentPriority})`,
      };
    }

    return {
      shouldBlock: false,
      blockingWorkOrders: [],
      reason: 'No blocking work orders',
    };
  }

  /**
   * Get recommended processing order for work orders
   * Sorts by effective priority (descending) and then by deadline (ascending)
   */
  getRecommendedProcessingOrder(workOrders: WorkOrder[]): WorkOrder[] {
    return [...workOrders].sort((a, b) => {
      // First compare by effective priority (higher first)
      const priorityDiff = b.getEffectivePriority() - a.getEffectivePriority();
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      // If priorities equal, compare by deadline (earlier first)
      const aDeadline = a.getDeadline();
      const bDeadline = b.getDeadline();

      if (!aDeadline && !bDeadline) return 0;
      if (!aDeadline) return 1; // Items without deadline go last
      if (!bDeadline) return -1;

      return aDeadline.getTime() - bDeadline.getTime();
    });
  }

  /**
   * Calculate priority violation score
   * Returns score indicating how badly priority order is violated
   * 0 = no violations, higher = more violations
   */
  calculatePriorityViolationScore(
    completionOrder: WorkOrder[],
  ): {
    score: number;
    violations: Array<{ workOrder: WorkOrder; reason: string }>;
  } {
    const violations: Array<{ workOrder: WorkOrder; reason: string }> = [];
    let score = 0;

    for (let i = 0; i < completionOrder.length - 1; i++) {
      const current = completionOrder[i];
      const next = completionOrder[i + 1];

      const currentPriority = current.getEffectivePriority();
      const nextPriority = next.getEffectivePriority();

      // Check if lower priority was completed before higher priority
      if (currentPriority < nextPriority) {
        const violation = nextPriority - currentPriority;
        score += violation;

        violations.push({
          workOrder: current,
          reason: `Priority ${currentPriority} completed before priority ${nextPriority}`,
        });
      }
    }

    return { score, violations };
  }

  /**
   * Check if work order can be started given priority constraints
   */
  canStartWorkOrder(
    workOrder: WorkOrder,
    allWorkOrders: WorkOrder[],
  ): {
    canStart: boolean;
    reason: string;
  } {
    // Check if blocked by higher priority items
    const blockCheck = this.shouldBlockByPriority(workOrder, allWorkOrders);

    if (blockCheck.shouldBlock) {
      return {
        canStart: false,
        reason: blockCheck.reason,
      };
    }

    return {
      canStart: true,
      reason: 'No priority constraints',
    };
  }

  /**
   * Get priority statistics for a set of work orders
   */
  getPriorityStats(workOrders: WorkOrder[]): {
    averagePriority: number;
    highestPriority: number;
    lowestPriority: number;
    overrideCount: number;
    priorityDistribution: Record<number, number>;
  } {
    if (workOrders.length === 0) {
      return {
        averagePriority: 0,
        highestPriority: 0,
        lowestPriority: 0,
        overrideCount: 0,
        priorityDistribution: {},
      };
    }

    const priorities = workOrders.map(wo => wo.getEffectivePriority());
    const overrideCount = workOrders.filter(wo => wo.getPriorityOverride() !== null).length;

    const priorityDistribution: Record<number, number> = {};
    for (const priority of priorities) {
      priorityDistribution[priority] = (priorityDistribution[priority] || 0) + 1;
    }

    return {
      averagePriority: priorities.reduce((sum, p) => sum + p, 0) / priorities.length,
      highestPriority: Math.max(...priorities),
      lowestPriority: Math.min(...priorities),
      overrideCount,
      priorityDistribution,
    };
  }
}

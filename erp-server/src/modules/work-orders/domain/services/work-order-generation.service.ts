import { Injectable, Inject } from '@nestjs/common';
import { WorkOrder } from '../entities/work-order.entity';
import { WorkOrderItem } from '../entities/work-order-item.entity';
import { IWorkOrderRepository, WORK_ORDER_REPOSITORY } from '../repositories/work-order.repository.interface';
import { DomainException } from '../../../../common/exceptions/domain.exception';

/**
 * Input data structures for work order generation
 */

export interface OrderItemForGeneration {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unit: string;
  propertyValues: Map<number, number>; // Map<propertyId, propertyValueId>
}

export interface OperationStepForGeneration {
  operationId: number;
  operationCode: string;
  operationName: string;
  stepNumber: number;
  isRequired: boolean;
}

export interface OperationRateForGeneration {
  operationId: number;
  propertyValueId: number | null;
  ratePerUnit: number;
  timePerUnit: number;
}

export interface DepartmentForOperation {
  departmentId: number;
  departmentName: string;
  priority: number;
}

export interface OrderDataForGeneration {
  orderId: number;
  orderNumber: string;
  deadline: Date | null;
  items: OrderItemForGeneration[];
}

/**
 * WorkOrderGenerationService - Domain Service
 * 
 * Responsible for generating work orders from orders by:
 * 1. Building technological routes for each product
 * 2. Calculating estimated hours and piece rates
 * 3. Creating work orders for each operation
 * 4. Selecting appropriate departments
 * 5. Calculating priorities based on deadline
 * 
 * This is a complex domain service that orchestrates multiple aggregates
 * and domain logic to produce work orders.
 */
@Injectable()
export class WorkOrderGenerationService {
  constructor(
    @Inject(WORK_ORDER_REPOSITORY)
    private readonly workOrderRepository: IWorkOrderRepository,
  ) {}

  /**
   * Generate work orders from an order
   * Returns array of created work orders
   */
  async generateWorkOrders(input: {
    orderData: OrderDataForGeneration;
    operationSteps: Map<number, OperationStepForGeneration[]>; // Map<productId, steps[]>
    operationRates: OperationRateForGeneration[];
    departmentsByOperation: Map<number, DepartmentForOperation[]>; // Map<operationId, departments[]>
  }): Promise<WorkOrder[]> {
    const { orderData, operationSteps, operationRates, departmentsByOperation } = input;

    // Validate input
    this.validateInput(orderData, operationSteps, departmentsByOperation);

    const workOrders: WorkOrder[] = [];

    // Calculate priority based on deadline
    const priority = this.calculatePriorityFromDeadline(orderData.deadline);

    // Group items by operation (we'll handle grouping strategy later in task 3.10)
    // For now, create one work order per operation per item
    for (const item of orderData.items) {
      const steps = operationSteps.get(item.productId);
      if (!steps || steps.length === 0) {
        throw new DomainException(
          `No technological route found for product ${item.productId}`,
        );
      }

      // Create work order for each operation
      for (const step of steps) {
        // Find appropriate department
        const departments = departmentsByOperation.get(step.operationId);
        if (!departments || departments.length === 0) {
          throw new DomainException(
            `No department found for operation ${step.operationId}`,
          );
        }

        // Select department with highest priority
        const selectedDepartment = this.selectOptimalDepartment(departments);

        // Calculate estimated hours and piece rate
        const { estimatedHours, pieceRate } = this.calculateOperationMetrics(
          item,
          step.operationId,
          operationRates,
        );

        // Generate work order number
        const workOrderNumber = await this.workOrderRepository.generateWorkOrderNumber();

        // Create work order
        const workOrder = WorkOrder.create({
          workOrderNumber,
          orderId: orderData.orderId,
          orderNumber: orderData.orderNumber,
          departmentId: selectedDepartment.departmentId,
          departmentName: selectedDepartment.departmentName,
          operationId: step.operationId,
          operationName: step.operationName,
          priority,
          deadline: orderData.deadline,
        });

        // Create work order item
        const workOrderItem = WorkOrderItem.create({
          workOrderId: 0, // Will be set after saving
          orderItemId: item.id,
          productId: item.productId,
          productName: item.productName,
          operationId: step.operationId,
          operationName: step.operationName,
          quantity: item.quantity,
          unit: item.unit,
          estimatedHours,
          pieceRate,
        });

        // Add item to work order
        workOrder.addItem(workOrderItem);

        // Save work order
        const savedWorkOrder = await this.workOrderRepository.save(workOrder);
        workOrders.push(savedWorkOrder);
      }
    }

    return workOrders;
  }

  /**
   * Calculate priority (1-10) based on order deadline
   * Closer deadline = higher priority
   */
  private calculatePriorityFromDeadline(deadline: Date | null): number {
    if (!deadline) {
      return 5; // Default medium priority
    }

    const now = new Date();
    const daysUntilDeadline = Math.ceil(
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Priority scale:
    // <= 0 days (overdue): 10 (urgent)
    // 1-3 days: 9
    // 4-7 days: 8
    // 8-14 days: 7
    // 15-21 days: 6
    // 22-30 days: 5
    // 31-60 days: 4
    // 61-90 days: 3
    // 91-180 days: 2
    // > 180 days: 1

    if (daysUntilDeadline <= 0) return 10;
    if (daysUntilDeadline <= 3) return 9;
    if (daysUntilDeadline <= 7) return 8;
    if (daysUntilDeadline <= 14) return 7;
    if (daysUntilDeadline <= 21) return 6;
    if (daysUntilDeadline <= 30) return 5;
    if (daysUntilDeadline <= 60) return 4;
    if (daysUntilDeadline <= 90) return 3;
    if (daysUntilDeadline <= 180) return 2;
    return 1;
  }

  /**
   * Select optimal department for an operation
   * Currently selects by priority, can be extended with workload balancing
   */
  private selectOptimalDepartment(
    departments: DepartmentForOperation[],
  ): DepartmentForOperation {
    // Sort by priority (highest first)
    const sorted = [...departments].sort((a, b) => b.priority - a.priority);
    
    // Return highest priority department
    // In future, can add workload balancing logic here
    return sorted[0];
  }

  /**
   * Calculate estimated hours and piece rate for an item/operation combination
   */
  private calculateOperationMetrics(
    item: OrderItemForGeneration,
    operationId: number,
    operationRates: OperationRateForGeneration[],
  ): { estimatedHours: number; pieceRate: number } {
    // Find applicable rates
    // Priority: specific property value rate > general rate
    let specificRate: OperationRateForGeneration | undefined;
    let generalRate: OperationRateForGeneration | undefined;

    for (const rate of operationRates) {
      if (rate.operationId !== operationId) continue;

      if (rate.propertyValueId === null) {
        generalRate = rate;
      } else {
        // Check if this property value matches the item
        for (const [, propertyValueId] of item.propertyValues) {
          if (propertyValueId === rate.propertyValueId) {
            specificRate = rate;
            break;
          }
        }
      }
    }

    // Use specific rate if available, otherwise general rate
    const applicableRate = specificRate || generalRate;

    if (!applicableRate) {
      // No rate found, use defaults
      return {
        estimatedHours: 0,
        pieceRate: 0,
      };
    }

    // Calculate metrics
    const estimatedHours = applicableRate.timePerUnit * item.quantity;
    const pieceRate = applicableRate.ratePerUnit;

    return {
      estimatedHours,
      pieceRate,
    };
  }

  /**
   * Validate input data
   */
  private validateInput(
    orderData: OrderDataForGeneration,
    operationSteps: Map<number, OperationStepForGeneration[]>,
    departmentsByOperation: Map<number, DepartmentForOperation[]>,
  ): void {
    if (!orderData || !orderData.items || orderData.items.length === 0) {
      throw new DomainException('Order must have at least one item');
    }

    if (!operationSteps || operationSteps.size === 0) {
      throw new DomainException('Operation steps must be provided');
    }

    if (!departmentsByOperation || departmentsByOperation.size === 0) {
      throw new DomainException('Department mappings must be provided');
    }
  }

  /**
   * Check if work orders can be generated for an order
   */
  canGenerateWorkOrders(orderData: OrderDataForGeneration): {
    canGenerate: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];

    if (!orderData.items || orderData.items.length === 0) {
      reasons.push('Order has no items');
    }

    for (const item of orderData.items || []) {
      if (item.quantity <= 0) {
        reasons.push(`Item ${item.id} has invalid quantity`);
      }
    }

    return {
      canGenerate: reasons.length === 0,
      reasons,
    };
  }

  /**
   * Regenerate work orders for an order
   * Cancels existing work orders and creates new ones
   */
  async regenerateWorkOrders(
    orderId: number,
    input: {
      orderData: OrderDataForGeneration;
      operationSteps: Map<number, OperationStepForGeneration[]>;
      operationRates: OperationRateForGeneration[];
      departmentsByOperation: Map<number, DepartmentForOperation[]>;
    },
  ): Promise<WorkOrder[]> {
    // Find existing work orders
    const existingWorkOrders = await this.workOrderRepository.findByOrderId(orderId);

    // Cancel work orders that are not completed
    for (const workOrder of existingWorkOrders) {
      if (!workOrder.isCompleted() && !workOrder.isCancelled()) {
        workOrder.cancel('Regenerating work orders for updated order');
        await this.workOrderRepository.save(workOrder);
      }
    }

    // Generate new work orders
    return await this.generateWorkOrders(input);
  }
}

import { WorkOrder } from '../entities/work-order.entity';
import { WorkOrderStatus } from '../enums/work-order-status.enum';

/**
 * Work Order Repository Interface
 * Abstract class (not interface) for TypeScript decorator metadata compatibility
 */
export abstract class IWorkOrderRepository {
  abstract save(workOrder: WorkOrder): Promise<WorkOrder>;
  abstract findById(id: number): Promise<WorkOrder | null>;
  abstract findByWorkOrderNumber(workOrderNumber: string): Promise<WorkOrder | null>;
  abstract findByOrderId(orderId: number): Promise<WorkOrder[]>;
  abstract findByDepartmentId(departmentId: number): Promise<WorkOrder[]>;
  abstract findByDepartmentIdAndStatus(
    departmentId: number,
    status: WorkOrderStatus,
  ): Promise<WorkOrder[]>;
  abstract findByStatus(status: WorkOrderStatus): Promise<WorkOrder[]>;
  abstract findAll(): Promise<WorkOrder[]>;
  abstract generateWorkOrderNumber(): Promise<string>;
  abstract delete(id: number): Promise<void>;
}

export const WORK_ORDER_REPOSITORY = Symbol('WORK_ORDER_REPOSITORY');

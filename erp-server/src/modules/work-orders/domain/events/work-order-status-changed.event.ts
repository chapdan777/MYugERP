import { WorkOrderStatus } from '../enums/work-order-status.enum';

/**
 * WorkOrderStatusChanged Event
 * 
 * Emitted when a work order's status changes
 */
export class WorkOrderStatusChangedEvent {
  constructor(
    public readonly workOrderId: number,
    public readonly workOrderNumber: string,
    public readonly previousStatus: WorkOrderStatus,
    public readonly newStatus: WorkOrderStatus,
    public readonly changedAt: Date,
    public readonly changedBy?: number, // User ID who triggered the change
  ) {}
}

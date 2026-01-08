/**
 * WorkOrderQualityCheckFailed Event
 * 
 * Emitted when a work order fails quality check and is returned to production
 */
export class WorkOrderQualityCheckFailedEvent {
  constructor(
    public readonly workOrderId: number,
    public readonly workOrderNumber: string,
    public readonly departmentId: number,
    public readonly failureReason: string,
    public readonly failedAt: Date,
    public readonly failedBy?: number, // Quality inspector ID
  ) {}
}

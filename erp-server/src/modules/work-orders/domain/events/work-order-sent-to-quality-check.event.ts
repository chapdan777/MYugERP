/**
 * WorkOrderSentToQualityCheck Event
 * 
 * Emitted when work is completed and sent for quality inspection
 */
export class WorkOrderSentToQualityCheckEvent {
  constructor(
    public readonly workOrderId: number,
    public readonly workOrderNumber: string,
    public readonly departmentId: number,
    public readonly sentToQualityCheckAt: Date,
    public readonly totalEstimatedHours: number,
    public readonly totalActualHours: number | null,
  ) {}
}

/**
 * WorkOrderCompleted Event
 * 
 * Emitted when a work order is completed (quality check passed)
 */
export class WorkOrderCompletedEvent {
  constructor(
    public readonly workOrderId: number,
    public readonly workOrderNumber: string,
    public readonly orderId: number,
    public readonly departmentId: number,
    public readonly completedAt: Date,
    public readonly totalEstimatedHours: number,
    public readonly totalActualHours: number | null,
    public readonly totalPieceRatePayment: number,
  ) {}
}

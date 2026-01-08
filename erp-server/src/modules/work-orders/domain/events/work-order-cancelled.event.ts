/**
 * WorkOrderCancelled Event
 * 
 * Emitted when a work order is cancelled
 */
export class WorkOrderCancelledEvent {
  constructor(
    public readonly workOrderId: number,
    public readonly workOrderNumber: string,
    public readonly orderId: number,
    public readonly reason: string,
    public readonly cancelledAt: Date,
    public readonly cancelledBy?: number, // User ID who cancelled
  ) {}
}

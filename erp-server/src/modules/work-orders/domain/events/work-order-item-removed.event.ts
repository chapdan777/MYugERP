/**
 * WorkOrderItemRemoved Event
 * 
 * Emitted when an item is removed from a work order
 */
export class WorkOrderItemRemovedEvent {
  constructor(
    public readonly workOrderId: number,
    public readonly workOrderNumber: string,
    public readonly itemId: number,
    public readonly orderItemId: number,
    public readonly removedAt: Date,
  ) {}
}

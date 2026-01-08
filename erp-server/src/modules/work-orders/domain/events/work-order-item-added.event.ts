/**
 * WorkOrderItemAdded Event
 * 
 * Emitted when an item is added to a work order
 */
export class WorkOrderItemAddedEvent {
  constructor(
    public readonly workOrderId: number,
    public readonly workOrderNumber: string,
    public readonly itemId: number,
    public readonly orderItemId: number,
    public readonly productId: number,
    public readonly productName: string,
    public readonly quantity: number,
    public readonly addedAt: Date,
  ) {}
}

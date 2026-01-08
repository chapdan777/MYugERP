/**
 * WorkOrderCreated Event
 * 
 * Emitted when a new work order is created
 */
export class WorkOrderCreatedEvent {
  constructor(
    public readonly workOrderId: number,
    public readonly workOrderNumber: string,
    public readonly orderId: number,
    public readonly orderNumber: string,
    public readonly departmentId: number,
    public readonly operationId: number,
    public readonly priority: number,
    public readonly deadline: Date | null,
    public readonly createdAt: Date,
  ) {}
}

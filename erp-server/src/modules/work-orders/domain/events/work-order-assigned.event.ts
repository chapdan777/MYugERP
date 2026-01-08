/**
 * WorkOrderAssigned Event
 * 
 * Emitted when a work order is assigned to a department/workers
 */
export class WorkOrderAssignedEvent {
  constructor(
    public readonly workOrderId: number,
    public readonly workOrderNumber: string,
    public readonly departmentId: number,
    public readonly departmentName: string,
    public readonly assignedAt: Date,
    public readonly assignedBy?: number, // User ID who performed the assignment
  ) {}
}

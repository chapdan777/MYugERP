/**
 * WorkOrderStarted Event
 * 
 * Emitted when work begins on a work order
 */
export class WorkOrderStartedEvent {
  constructor(
    public readonly workOrderId: number,
    public readonly workOrderNumber: string,
    public readonly departmentId: number,
    public readonly startedAt: Date,
    public readonly startedBy?: number, // User/Worker ID who started the work
  ) {}
}

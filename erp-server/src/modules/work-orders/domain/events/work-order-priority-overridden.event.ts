/**
 * WorkOrderPriorityOverridden Event
 * 
 * Emitted when a work order's priority is manually overridden
 */
export class WorkOrderPriorityOverriddenEvent {
  constructor(
    public readonly workOrderId: number,
    public readonly workOrderNumber: string,
    public readonly previousPriority: number,
    public readonly newPriority: number,
    public readonly reason: string,
    public readonly overriddenAt: Date,
    public readonly overriddenBy?: number, // User ID who overrode priority
  ) {}
}

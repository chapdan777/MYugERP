/**
 * WorkOrderActualHoursRecorded Event
 * 
 * Emitted when actual hours are recorded for a work order item
 */
export class WorkOrderActualHoursRecordedEvent {
  constructor(
    public readonly workOrderId: number,
    public readonly workOrderNumber: string,
    public readonly itemId: number,
    public readonly actualHours: number,
    public readonly recordedAt: Date,
    public readonly recordedBy?: number, // Worker/User ID
  ) {}
}

/**
 * WorkOrderStatus Enum
 * 
 * Represents the lifecycle of a work order from planning to completion
 */
export enum WorkOrderStatus {
  PLANNED = 'PLANNED',           // Work order created but not yet assigned
  ASSIGNED = 'ASSIGNED',         // Assigned to department/workers
  IN_PROGRESS = 'IN_PROGRESS',   // Work has started
  QUALITY_CHECK = 'QUALITY_CHECK', // Work completed, awaiting quality inspection
  COMPLETED = 'COMPLETED',       // Quality check passed, work order finished
  CANCELLED = 'CANCELLED',       // Work order cancelled
}

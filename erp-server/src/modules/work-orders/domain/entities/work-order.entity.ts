import { DomainException } from '../../../../common/exceptions/domain.exception';
import { WorkOrderStatus } from '../enums/work-order-status.enum';
import { WorkOrderItem } from './work-order-item.entity';

/**
 * WorkOrder Entity - Aggregate Root
 * 
 * Represents a production work order that groups one or more order items
 * to be processed by a specific department/operation.
 * 
 * Business Rules:
 * - Must have at least one item
 * - Can only be assigned to one department
 * - Status transitions follow a specific workflow
 * - Cannot modify items after status is IN_PROGRESS
 * - Priority is calculated from order deadline
 * - Can have priority override but requires explanation
 */
export class WorkOrder {
  private id?: number;
  private workOrderNumber: string; // Unique identifier (auto-generated)
  private orderId: number; // Reference to parent Order
  private orderNumber: string; // Denormalized for quick reference
  private departmentId: number;
  private departmentName: string;
  private operationId: number;
  private operationName: string;
  private status: WorkOrderStatus;
  private priority: number; // 1-10, calculated from order deadline
  private priorityOverride: number | null; // Manual override if needed
  private priorityOverrideReason: string | null;
  private deadline: Date | null; // Inherited from order
  private assignedAt: Date | null;
  private startedAt: Date | null;
  private completedAt: Date | null;
  private items: WorkOrderItem[];
  private notes: string | null;
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(
    id: number | undefined,
    workOrderNumber: string,
    orderId: number,
    orderNumber: string,
    departmentId: number,
    departmentName: string,
    operationId: number,
    operationName: string,
    status: WorkOrderStatus,
    priority: number,
    priorityOverride: number | null,
    priorityOverrideReason: string | null,
    deadline: Date | null,
    assignedAt: Date | null,
    startedAt: Date | null,
    completedAt: Date | null,
    items: WorkOrderItem[],
    notes: string | null,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.workOrderNumber = workOrderNumber;
    this.orderId = orderId;
    this.orderNumber = orderNumber;
    this.departmentId = departmentId;
    this.departmentName = departmentName;
    this.operationId = operationId;
    this.operationName = operationName;
    this.status = status;
    this.priority = priority;
    this.priorityOverride = priorityOverride;
    this.priorityOverrideReason = priorityOverrideReason;
    this.deadline = deadline;
    this.assignedAt = assignedAt;
    this.startedAt = startedAt;
    this.completedAt = completedAt;
    this.items = items;
    this.notes = notes;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Factory method to create a new WorkOrder
   */
  static create(props: {
    workOrderNumber: string;
    orderId: number;
    orderNumber: string;
    departmentId: number;
    departmentName: string;
    operationId: number;
    operationName: string;
    priority: number;
    deadline?: Date | null;
    notes?: string | null;
  }): WorkOrder {
    WorkOrder.validateWorkOrderNumber(props.workOrderNumber);
    WorkOrder.validatePriority(props.priority);

    const now = new Date();

    return new WorkOrder(
      undefined,
      props.workOrderNumber,
      props.orderId,
      props.orderNumber,
      props.departmentId,
      props.departmentName,
      props.operationId,
      props.operationName,
      WorkOrderStatus.PLANNED,
      props.priority,
      null,
      null,
      props.deadline || null,
      null,
      null,
      null,
      [],
      props.notes || null,
      now,
      now,
    );
  }

  /**
   * Factory method to restore WorkOrder from database
   */
  static restore(
    id: number,
    workOrderNumber: string,
    orderId: number,
    orderNumber: string,
    departmentId: number,
    departmentName: string,
    operationId: number,
    operationName: string,
    status: WorkOrderStatus,
    priority: number,
    priorityOverride: number | null,
    priorityOverrideReason: string | null,
    deadline: Date | null,
    assignedAt: Date | null,
    startedAt: Date | null,
    completedAt: Date | null,
    items: WorkOrderItem[],
    notes: string | null,
    createdAt: Date,
    updatedAt: Date,
  ): WorkOrder {
    return new WorkOrder(
      id,
      workOrderNumber,
      orderId,
      orderNumber,
      departmentId,
      departmentName,
      operationId,
      operationName,
      status,
      priority,
      priorityOverride,
      priorityOverrideReason,
      deadline,
      assignedAt,
      startedAt,
      completedAt,
      items,
      notes,
      createdAt,
      updatedAt,
    );
  }

  // Validation methods
  private static validateWorkOrderNumber(number: string): void {
    if (!number || number.trim().length === 0) {
      throw new DomainException('Work order number cannot be empty');
    }
  }

  private static validatePriority(priority: number): void {
    if (priority < 1 || priority > 10) {
      throw new DomainException('Priority must be between 1 and 10');
    }
  }

  // Business methods

  /**
   * Add item to work order
   */
  addItem(item: WorkOrderItem): void {
    if (this.status !== WorkOrderStatus.PLANNED) {
      throw new DomainException('Cannot add items to work order after it is planned');
    }
    this.items.push(item);
    this.updatedAt = new Date();
  }

  /**
   * Remove item from work order
   */
  removeItem(itemId: number): void {
    if (this.status !== WorkOrderStatus.PLANNED) {
      throw new DomainException('Cannot remove items from work order after it is planned');
    }
    const index = this.items.findIndex(i => i.getId() === itemId);
    if (index === -1) {
      throw new DomainException(`Item with ID ${itemId} not found in work order`);
    }
    this.items.splice(index, 1);
    this.updatedAt = new Date();
  }

  /**
   * Assign work order to workers (transition to ASSIGNED)
   */
  assign(): void {
    if (this.status !== WorkOrderStatus.PLANNED) {
      throw new DomainException(`Cannot assign work order in status ${this.status}`);
    }
    if (this.items.length === 0) {
      throw new DomainException('Cannot assign work order without items');
    }
    this.status = WorkOrderStatus.ASSIGNED;
    this.assignedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Start work (transition to IN_PROGRESS)
   */
  start(): void {
    if (this.status !== WorkOrderStatus.ASSIGNED) {
      throw new DomainException(`Cannot start work order in status ${this.status}`);
    }
    this.status = WorkOrderStatus.IN_PROGRESS;
    this.startedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Complete work and send to quality check
   */
  sendToQualityCheck(): void {
    if (this.status !== WorkOrderStatus.IN_PROGRESS) {
      throw new DomainException(`Cannot send to quality check from status ${this.status}`);
    }
    this.status = WorkOrderStatus.QUALITY_CHECK;
    this.updatedAt = new Date();
  }

  /**
   * Complete work order after quality check passed
   */
  complete(): void {
    if (this.status !== WorkOrderStatus.QUALITY_CHECK) {
      throw new DomainException(`Cannot complete work order in status ${this.status}`);
    }
    this.status = WorkOrderStatus.COMPLETED;
    this.completedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Cancel work order
   */
  cancel(reason: string): void {
    if (this.status === WorkOrderStatus.COMPLETED) {
      throw new DomainException('Cannot cancel completed work order');
    }
    if (this.status === WorkOrderStatus.CANCELLED) {
      throw new DomainException('Work order is already cancelled');
    }
    this.status = WorkOrderStatus.CANCELLED;
    this.notes = `CANCELLED: ${reason}${this.notes ? '\n\n' + this.notes : ''}`;
    this.updatedAt = new Date();
  }

  /**
   * Override priority with explanation
   */
  overridePriority(newPriority: number, reason: string): void {
    WorkOrder.validatePriority(newPriority);
    if (!reason || reason.trim().length === 0) {
      throw new DomainException('Priority override requires a reason');
    }
    this.priorityOverride = newPriority;
    this.priorityOverrideReason = reason;
    this.updatedAt = new Date();
  }

  /**
   * Clear priority override
   */
  clearPriorityOverride(): void {
    this.priorityOverride = null;
    this.priorityOverrideReason = null;
    this.updatedAt = new Date();
  }

  /**
   * Get effective priority (override takes precedence)
   */
  getEffectivePriority(): number {
    return this.priorityOverride ?? this.priority;
  }

  /**
   * Update notes
   */
  updateNotes(notes: string): void {
    this.notes = notes;
    this.updatedAt = new Date();
  }

  /**
   * Calculate total estimated hours across all items
   */
  getTotalEstimatedHours(): number {
    return this.items.reduce((sum, item) => sum + item.getEstimatedHours(), 0);
  }

  /**
   * Calculate total actual hours (if recorded)
   */
  getTotalActualHours(): number | null {
    const allRecorded = this.items.every(i => i.hasActualHours());
    if (!allRecorded) {
      return null;
    }
    return this.items.reduce((sum, item) => sum + (item.getActualHours() || 0), 0);
  }

  /**
   * Calculate total piece rate payment for all items
   */
  getTotalPieceRatePayment(): number {
    return this.items.reduce((sum, item) => sum + item.calculatePieceRatePayment(), 0);
  }

  /**
   * Check if work order can be modified
   */
  canBeModified(): boolean {
    return this.status === WorkOrderStatus.PLANNED;
  }

  /**
   * Check if work order is in progress
   */
  isInProgress(): boolean {
    return this.status === WorkOrderStatus.IN_PROGRESS;
  }

  /**
   * Check if work order is completed
   */
  isCompleted(): boolean {
    return this.status === WorkOrderStatus.COMPLETED;
  }

  /**
   * Check if work order is cancelled
   */
  isCancelled(): boolean {
    return this.status === WorkOrderStatus.CANCELLED;
  }

  // Getters
  getId(): number | undefined {
    return this.id;
  }

  getWorkOrderNumber(): string {
    return this.workOrderNumber;
  }

  getOrderId(): number {
    return this.orderId;
  }

  getOrderNumber(): string {
    return this.orderNumber;
  }

  getDepartmentId(): number {
    return this.departmentId;
  }

  getDepartmentName(): string {
    return this.departmentName;
  }

  getOperationId(): number {
    return this.operationId;
  }

  getOperationName(): string {
    return this.operationName;
  }

  getStatus(): WorkOrderStatus {
    return this.status;
  }

  getPriority(): number {
    return this.priority;
  }

  getPriorityOverride(): number | null {
    return this.priorityOverride;
  }

  getPriorityOverrideReason(): string | null {
    return this.priorityOverrideReason;
  }

  getDeadline(): Date | null {
    return this.deadline;
  }

  getAssignedAt(): Date | null {
    return this.assignedAt;
  }

  getStartedAt(): Date | null {
    return this.startedAt;
  }

  getCompletedAt(): Date | null {
    return this.completedAt;
  }

  getItems(): WorkOrderItem[] {
    return [...this.items];
  }

  getNotes(): string | null {
    return this.notes;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}

/**
 * WorkerAssignment Entity
 * 
 * Represents the assignment of one or more workers to a work order
 * Supports both individual assignments and team/brigade assignments
 */
export class WorkerAssignment {
  private constructor(
    private id: number | null,
    private workOrderId: number,
    private workOrderNumber: string,
    private workerId: number,
    private workerName: string,
    private role: WorkerRole,
    private assignedAt: Date,
    private unassignedAt: Date | null,
    private assignedBy: number, // User ID who made the assignment
    private unassignedBy: number | null,
    private unassignmentReason: string | null,
    private isActive: boolean,
    private hoursWorked: number,
    private notes: string | null,
    private createdAt: Date,
    private updatedAt: Date,
  ) {}

  /**
   * Create new WorkerAssignment
   */
  static create(input: {
    workOrderId: number;
    workOrderNumber: string;
    workerId: number;
    workerName: string;
    role: WorkerRole;
    assignedBy: number;
    notes?: string | null;
  }): WorkerAssignment {
    const now = new Date();

    // Validate inputs
    if (input.workOrderId <= 0) {
      throw new Error('Work order ID must be positive');
    }
    if (!input.workOrderNumber || input.workOrderNumber.trim() === '') {
      throw new Error('Work order number is required');
    }
    if (input.workerId <= 0) {
      throw new Error('Worker ID must be positive');
    }
    if (!input.workerName || input.workerName.trim() === '') {
      throw new Error('Worker name is required');
    }
    if (input.assignedBy <= 0) {
      throw new Error('Assigned by user ID must be positive');
    }

    return new WorkerAssignment(
      null,
      input.workOrderId,
      input.workOrderNumber,
      input.workerId,
      input.workerName,
      input.role,
      now,
      null,
      input.assignedBy,
      null,
      null,
      true,
      0,
      input.notes ?? null,
      now,
      now,
    );
  }

  /**
   * Restore WorkerAssignment from database
   */
  static restore(data: {
    id: number;
    workOrderId: number;
    workOrderNumber: string;
    workerId: number;
    workerName: string;
    role: WorkerRole;
    assignedAt: Date;
    unassignedAt: Date | null;
    assignedBy: number;
    unassignedBy: number | null;
    unassignmentReason: string | null;
    isActive: boolean;
    hoursWorked: number;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): WorkerAssignment {
    return new WorkerAssignment(
      data.id,
      data.workOrderId,
      data.workOrderNumber,
      data.workerId,
      data.workerName,
      data.role,
      data.assignedAt,
      data.unassignedAt,
      data.assignedBy,
      data.unassignedBy,
      data.unassignmentReason,
      data.isActive,
      data.hoursWorked,
      data.notes,
      data.createdAt,
      data.updatedAt,
    );
  }

  // Getters
  getId(): number | null {
    return this.id;
  }

  getWorkOrderId(): number {
    return this.workOrderId;
  }

  getWorkOrderNumber(): string {
    return this.workOrderNumber;
  }

  getWorkerId(): number {
    return this.workerId;
  }

  getWorkerName(): string {
    return this.workerName;
  }

  getRole(): WorkerRole {
    return this.role;
  }

  getAssignedAt(): Date {
    return this.assignedAt;
  }

  getUnassignedAt(): Date | null {
    return this.unassignedAt;
  }

  getAssignedBy(): number {
    return this.assignedBy;
  }

  getUnassignedBy(): number | null {
    return this.unassignedBy;
  }

  getUnassignmentReason(): string | null {
    return this.unassignmentReason;
  }

  isActiveAssignment(): boolean {
    return this.isActive;
  }

  getHoursWorked(): number {
    return this.hoursWorked;
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

  /**
   * Check if assignment is currently active
   */
  isCurrentlyAssigned(): boolean {
    return this.isActive && this.unassignedAt === null;
  }

  /**
   * Check if worker is lead/supervisor
   */
  isLeadWorker(): boolean {
    return this.role === WorkerRole.LEAD || this.role === WorkerRole.SUPERVISOR;
  }

  /**
   * Record hours worked
   */
  recordHours(hours: number): void {
    if (!this.isActive) {
      throw new Error('Cannot record hours for inactive assignment');
    }

    if (hours < 0) {
      throw new Error('Hours worked cannot be negative');
    }

    if (hours > 24) {
      throw new Error('Hours worked cannot exceed 24 per day');
    }

    this.hoursWorked += hours;
    this.updatedAt = new Date();
  }

  /**
   * Update worker role
   */
  updateRole(newRole: WorkerRole): void {
    if (!this.isActive) {
      throw new Error('Cannot update role for inactive assignment');
    }

    if (this.role === newRole) {
      throw new Error('New role is the same as current role');
    }

    this.role = newRole;
    this.updatedAt = new Date();
  }

  /**
   * Update assignment notes
   */
  updateNotes(notes: string | null): void {
    this.notes = notes;
    this.updatedAt = new Date();
  }

  /**
   * Unassign worker from work order
   */
  unassign(unassignedBy: number, reason: string): void {
    if (!this.isActive) {
      throw new Error('Assignment is already inactive');
    }

    if (this.unassignedAt !== null) {
      throw new Error('Worker is already unassigned');
    }

    if (unassignedBy <= 0) {
      throw new Error('Unassigned by user ID must be positive');
    }

    if (!reason || reason.trim() === '') {
      throw new Error('Unassignment reason is required');
    }

    const now = new Date();
    this.unassignedAt = now;
    this.unassignedBy = unassignedBy;
    this.unassignmentReason = reason;
    this.isActive = false;
    this.updatedAt = now;
  }

  /**
   * Reassign worker (reactivate assignment)
   */
  reassign(): void {
    if (this.isActive) {
      throw new Error('Assignment is already active');
    }

    if (this.unassignedAt === null) {
      throw new Error('Cannot reassign an assignment that was never unassigned');
    }

    const now = new Date();
    this.unassignedAt = null;
    this.unassignedBy = null;
    this.unassignmentReason = null;
    this.isActive = true;
    this.updatedAt = now;
  }

  /**
   * Calculate assignment duration in hours
   */
  getAssignmentDurationHours(): number {
    const endTime = this.unassignedAt ?? new Date();
    const durationMs = endTime.getTime() - this.assignedAt.getTime();
    return durationMs / (1000 * 60 * 60);
  }

  /**
   * Check if worker has worked more than specified percentage of assignment duration
   */
  hasWorkedMinimumPercentage(minimumPercentage: number): boolean {
    if (minimumPercentage < 0 || minimumPercentage > 100) {
      throw new Error('Minimum percentage must be between 0 and 100');
    }

    const assignmentDuration = this.getAssignmentDurationHours();
    if (assignmentDuration === 0) {
      return false;
    }

    const workedPercentage = (this.hoursWorked / assignmentDuration) * 100;
    return workedPercentage >= minimumPercentage;
  }
}

/**
 * Worker Role enum
 * Defines the role of a worker in a team/brigade assignment
 */
export enum WorkerRole {
  LEAD = 'LEAD',               // Team lead, responsible for coordination
  SUPERVISOR = 'SUPERVISOR',   // Supervises work, ensures quality
  OPERATOR = 'OPERATOR',       // Primary operator, performs main tasks
  ASSISTANT = 'ASSISTANT',     // Assists operators, learning
  TRAINEE = 'TRAINEE',         // In training, supervised work only
}

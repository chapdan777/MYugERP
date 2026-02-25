import { DomainException } from '../../../../common/exceptions/domain.exception';

/**
 * DepartmentOperation Entity
 * 
 * Links operations to departments, indicating which operations can be performed
 * in which departments. Multiple departments can perform the same operation,
 * and the system can choose the optimal one based on workload, priority, etc.
 * 
 * Business Rules:
 * - Each combination of departmentId + operationId must be unique
 * - Priority determines preference when multiple departments can do same operation
 * - Can be deactivated without deletion for historical integrity
 * - Higher priority number = higher preference
 */
export class DepartmentOperation {
  private id?: number;
  private departmentId: number;
  private operationId: number;
  private priority: number; // Higher number = higher priority (1-10)
  private isActive: boolean;
  private createdAt: Date;
  private updatedAt: Date;
  private operation?: { name: string; code: string };

  private constructor(
    id: number | undefined,
    departmentId: number,
    operationId: number,
    priority: number,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
    operation?: { name: string; code: string },
  ) {
    this.id = id;
    this.departmentId = departmentId;
    this.operationId = operationId;
    this.priority = priority;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.operation = operation;
  }

  getOperation(): { name: string; code: string } | undefined {
    return this.operation;
  }

  /**
   * Factory method to create a new DepartmentOperation
   */
  static create(props: {
    departmentId: number;
    operationId: number;
    priority?: number;
    isActive?: boolean;
  }): DepartmentOperation {
    DepartmentOperation.validateDepartmentId(props.departmentId);
    DepartmentOperation.validateOperationId(props.operationId);
    DepartmentOperation.validatePriority(props.priority ?? 5);

    const now = new Date();

    return new DepartmentOperation(
      undefined,
      props.departmentId,
      props.operationId,
      props.priority ?? 5, // Default priority is medium (5)
      props.isActive ?? true,
      now,
      now,
    );
  }

  /**
   * Factory method to restore DepartmentOperation from database
   */
  static restore(
    id: number,
    departmentId: number,
    operationId: number,
    priority: number,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
    operation?: { name: string; code: string },
  ): DepartmentOperation {
    return new DepartmentOperation(
      id,
      departmentId,
      operationId,
      priority,
      isActive,
      createdAt,
      updatedAt,
      operation,
    );
  }

  // Validation methods
  private static validateDepartmentId(departmentId: number): void {
    if (!departmentId || departmentId <= 0) {
      throw new DomainException('Department ID must be a positive number');
    }
  }

  private static validateOperationId(operationId: number): void {
    if (!operationId || operationId <= 0) {
      throw new DomainException('Operation ID must be a positive number');
    }
  }

  private static validatePriority(priority: number): void {
    if (priority < 1 || priority > 10) {
      throw new DomainException('Priority must be between 1 and 10');
    }
  }

  // Business methods

  /**
   * Update priority level
   */
  updatePriority(newPriority: number): void {
    DepartmentOperation.validatePriority(newPriority);
    this.priority = newPriority;
    this.updatedAt = new Date();
  }

  /**
   * Activate this department-operation link
   */
  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Deactivate this department-operation link
   */
  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  /**
   * Update department-operation info
   */
  updateInfo(props: {
    priority?: number;
    isActive?: boolean;
  }): void {
    if (props.priority !== undefined) {
      DepartmentOperation.validatePriority(props.priority);
      this.priority = props.priority;
    }

    if (props.isActive !== undefined) {
      this.isActive = props.isActive;
    }

    this.updatedAt = new Date();
  }

  /**
   * Check if this department-operation has higher priority than another
   */
  hasHigherPriorityThan(other: DepartmentOperation): boolean {
    return this.priority > other.priority;
  }

  // Getters
  getId(): number | undefined {
    return this.id;
  }

  getDepartmentId(): number {
    return this.departmentId;
  }

  getOperationId(): number {
    return this.operationId;
  }

  getPriority(): number {
    return this.priority;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}

import { DomainException } from '../../../../common/exceptions/domain.exception';

/**
 * OperationRate entity - defines pricing and time rates for operations
 * Can vary based on property values (e.g., different rates for different materials)
 */
export class OperationRate {
  private id?: number;
  private operationId: number;
  private propertyValueId: number | null; // If null, applies to all
  private ratePerUnit: number; // Cost per unit of work
  private timePerUnit: number; // Hours per unit of work
  private isActive: boolean;
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(props: {
    id?: number;
    operationId: number;
    propertyValueId?: number | null;
    ratePerUnit: number;
    timePerUnit: number;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.operationId = props.operationId;
    this.propertyValueId = props.propertyValueId ?? null;
    this.ratePerUnit = props.ratePerUnit;
    this.timePerUnit = props.timePerUnit;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();

    this.validate();
  }

  /**
   * Factory method to create a new operation rate
   */
  static create(props: {
    operationId: number;
    propertyValueId?: number | null;
    ratePerUnit: number;
    timePerUnit: number;
    isActive?: boolean;
  }): OperationRate {
    return new OperationRate(props);
  }

  /**
   * Factory method to restore from database
   */
  static restore(props: {
    id: number;
    operationId: number;
    propertyValueId: number | null;
    ratePerUnit: number;
    timePerUnit: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): OperationRate {
    return new OperationRate(props);
  }

  /**
   * Validate invariants
   */
  private validate(): void {
    if (this.operationId <= 0) {
      throw new DomainException('Operation ID must be positive');
    }
    if (this.ratePerUnit < 0) {
      throw new DomainException('Rate per unit cannot be negative');
    }
    if (this.timePerUnit <= 0) {
      throw new DomainException('Time per unit must be positive');
    }
  }

  /**
   * Update rate information
   */
  updateRate(props: { ratePerUnit?: number; timePerUnit?: number }): void {
    if (props.ratePerUnit !== undefined) {
      if (props.ratePerUnit < 0) {
        throw new DomainException('Rate per unit cannot be negative');
      }
      this.ratePerUnit = props.ratePerUnit;
    }

    if (props.timePerUnit !== undefined) {
      if (props.timePerUnit <= 0) {
        throw new DomainException('Time per unit must be positive');
      }
      this.timePerUnit = props.timePerUnit;
    }

    this.updatedAt = new Date();
  }

  // Getters
  getId(): number | undefined {
    return this.id;
  }

  getOperationId(): number {
    return this.operationId;
  }

  getPropertyValueId(): number | null {
    return this.propertyValueId;
  }

  getRatePerUnit(): number {
    return this.ratePerUnit;
  }

  getTimePerUnit(): number {
    return this.timePerUnit;
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

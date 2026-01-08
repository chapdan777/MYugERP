import { DomainException } from '../../../../common/exceptions/domain.exception';

/**
 * PropertyOperation Entity
 * 
 * Links operations to specific property values, enabling dynamic operation selection
 * based on product properties (e.g., different operations for different materials).
 * 
 * Business Rules:
 * - Each combination of propertyId + propertyValueId + operationId must be unique
 * - Can be marked as required or optional
 * - Can be deactivated without deletion for historical integrity
 */
export class PropertyOperation {
  private id?: number;
  private propertyId: number; // Reference to Property (e.g., Material property)
  private propertyValueId: number; // Reference to PropertyValue (e.g., "Wood")
  private operationId: number; // Reference to Operation (e.g., "Sanding")
  private isRequired: boolean; // Whether this operation is mandatory for this property value
  private isActive: boolean;
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(
    id: number | undefined,
    propertyId: number,
    propertyValueId: number,
    operationId: number,
    isRequired: boolean,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.propertyId = propertyId;
    this.propertyValueId = propertyValueId;
    this.operationId = operationId;
    this.isRequired = isRequired;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Factory method to create a new PropertyOperation
   */
  static create(props: {
    propertyId: number;
    propertyValueId: number;
    operationId: number;
    isRequired?: boolean;
    isActive?: boolean;
  }): PropertyOperation {
    PropertyOperation.validatePropertyId(props.propertyId);
    PropertyOperation.validatePropertyValueId(props.propertyValueId);
    PropertyOperation.validateOperationId(props.operationId);

    const now = new Date();

    return new PropertyOperation(
      undefined,
      props.propertyId,
      props.propertyValueId,
      props.operationId,
      props.isRequired ?? false,
      props.isActive ?? true,
      now,
      now,
    );
  }

  /**
   * Factory method to restore PropertyOperation from database
   */
  static restore(
    id: number,
    propertyId: number,
    propertyValueId: number,
    operationId: number,
    isRequired: boolean,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
  ): PropertyOperation {
    return new PropertyOperation(
      id,
      propertyId,
      propertyValueId,
      operationId,
      isRequired,
      isActive,
      createdAt,
      updatedAt,
    );
  }

  // Validation methods
  private static validatePropertyId(propertyId: number): void {
    if (!propertyId || propertyId <= 0) {
      throw new DomainException('Property ID must be a positive number');
    }
  }

  private static validatePropertyValueId(propertyValueId: number): void {
    if (!propertyValueId || propertyValueId <= 0) {
      throw new DomainException('Property Value ID must be a positive number');
    }
  }

  private static validateOperationId(operationId: number): void {
    if (!operationId || operationId <= 0) {
      throw new DomainException('Operation ID must be a positive number');
    }
  }

  // Business methods

  /**
   * Mark this property-operation link as required
   */
  markAsRequired(): void {
    this.isRequired = true;
    this.updatedAt = new Date();
  }

  /**
   * Mark this property-operation link as optional
   */
  markAsOptional(): void {
    this.isRequired = false;
    this.updatedAt = new Date();
  }

  /**
   * Activate this property-operation link
   */
  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Deactivate this property-operation link
   */
  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  /**
   * Update property-operation link info
   */
  updateInfo(props: {
    isRequired?: boolean;
    isActive?: boolean;
  }): void {
    if (props.isRequired !== undefined) {
      this.isRequired = props.isRequired;
    }
    if (props.isActive !== undefined) {
      this.isActive = props.isActive;
    }
    this.updatedAt = new Date();
  }

  // Getters
  getId(): number | undefined {
    return this.id;
  }

  getPropertyId(): number {
    return this.propertyId;
  }

  getPropertyValueId(): number {
    return this.propertyValueId;
  }

  getOperationId(): number {
    return this.operationId;
  }

  getIsRequired(): boolean {
    return this.isRequired;
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

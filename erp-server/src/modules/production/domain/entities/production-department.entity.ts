import { DomainException } from '../../../../common/exceptions/domain.exception';

/**
 * GroupingStrategy Enum
 * 
 * Defines how work orders should be grouped for this department:
 * - BY_ORDER: Group all items from same order together
 * - BY_PRODUCT: Group same products together regardless of order
 * - BY_PROPERTY: Group by specific property value (e.g., same material)
 * - NO_GROUPING: Each item becomes separate work order
 */
export enum GroupingStrategy {
  BY_ORDER = 'BY_ORDER',
  BY_PRODUCT = 'BY_PRODUCT',
  BY_PROPERTY = 'BY_PROPERTY',
  NO_GROUPING = 'NO_GROUPING',
}

/**
 * ProductionDepartment Entity
 * 
 * Represents a physical production department/workshop in the factory.
 * Each department can perform specific operations and has a grouping strategy
 * for work order generation.
 * 
 * Business Rules:
 * - Department code must be unique
 * - Can be deactivated without deletion for historical integrity
 * - Grouping strategy determines how work orders are batched
 * - Can specify property for BY_PROPERTY grouping strategy
 */
export class ProductionDepartment {
  private id?: number;
  private code: string; // Unique identifier (e.g., "CUT", "PAINT", "ASSEMBLY")
  private name: string;
  private description: string | null;
  private groupingStrategy: GroupingStrategy;
  private groupingPropertyId: number | null; // Used when strategy is BY_PROPERTY
  private isActive: boolean;
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(
    id: number | undefined,
    code: string,
    name: string,
    description: string | null,
    groupingStrategy: GroupingStrategy,
    groupingPropertyId: number | null,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.description = description;
    this.groupingStrategy = groupingStrategy;
    this.groupingPropertyId = groupingPropertyId;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Factory method to create a new ProductionDepartment
   */
  static create(props: {
    code: string;
    name: string;
    description?: string | null;
    groupingStrategy?: GroupingStrategy;
    groupingPropertyId?: number | null;
    isActive?: boolean;
  }): ProductionDepartment {
    ProductionDepartment.validateCode(props.code);
    ProductionDepartment.validateName(props.name);
    ProductionDepartment.validateGroupingStrategy(
      props.groupingStrategy || GroupingStrategy.BY_ORDER,
      props.groupingPropertyId || null,
    );

    const now = new Date();

    return new ProductionDepartment(
      undefined,
      props.code.trim().toUpperCase(),
      props.name.trim(),
      props.description?.trim() || null,
      props.groupingStrategy || GroupingStrategy.BY_ORDER,
      props.groupingPropertyId || null,
      props.isActive ?? true,
      now,
      now,
    );
  }

  /**
   * Factory method to restore ProductionDepartment from database
   */
  static restore(
    id: number,
    code: string,
    name: string,
    description: string | null,
    groupingStrategy: GroupingStrategy,
    groupingPropertyId: number | null,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
  ): ProductionDepartment {
    return new ProductionDepartment(
      id,
      code,
      name,
      description,
      groupingStrategy,
      groupingPropertyId,
      isActive,
      createdAt,
      updatedAt,
    );
  }

  // Validation methods
  private static validateCode(code: string): void {
    if (!code || code.trim().length === 0) {
      throw new DomainException('Department code cannot be empty');
    }
    if (code.trim().length > 20) {
      throw new DomainException('Department code cannot exceed 20 characters');
    }
  }

  private static validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new DomainException('Department name cannot be empty');
    }
    if (name.trim().length > 100) {
      throw new DomainException('Department name cannot exceed 100 characters');
    }
  }

  private static validateGroupingStrategy(
    strategy: GroupingStrategy,
    propertyId: number | null,
  ): void {
    if (strategy === GroupingStrategy.BY_PROPERTY && !propertyId) {
      throw new DomainException(
        'Grouping property ID is required when strategy is BY_PROPERTY',
      );
    }
    if (strategy !== GroupingStrategy.BY_PROPERTY && propertyId) {
      throw new DomainException(
        'Grouping property ID should only be set when strategy is BY_PROPERTY',
      );
    }
  }

  // Business methods

  /**
   * Activate the department
   */
  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Deactivate the department
   */
  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  /**
   * Update department information
   */
  updateInfo(props: {
    name?: string;
    description?: string | null;
    groupingStrategy?: GroupingStrategy;
    groupingPropertyId?: number | null;
    isActive?: boolean;
  }): void {
    if (props.name !== undefined) {
      ProductionDepartment.validateName(props.name);
      this.name = props.name.trim();
    }

    if (props.description !== undefined) {
      this.description = props.description?.trim() || null;
    }

    if (props.groupingStrategy !== undefined || props.groupingPropertyId !== undefined) {
      const newStrategy = props.groupingStrategy ?? this.groupingStrategy;
      const newPropertyId = props.groupingPropertyId !== undefined 
        ? props.groupingPropertyId 
        : this.groupingPropertyId;

      ProductionDepartment.validateGroupingStrategy(newStrategy, newPropertyId);
      this.groupingStrategy = newStrategy;
      this.groupingPropertyId = newPropertyId;
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

  getCode(): string {
    return this.code;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string | null {
    return this.description;
  }

  getGroupingStrategy(): GroupingStrategy {
    return this.groupingStrategy;
  }

  getGroupingPropertyId(): number | null {
    return this.groupingPropertyId;
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

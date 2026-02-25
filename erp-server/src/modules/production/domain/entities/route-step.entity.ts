import { DomainException } from '../../../../common/exceptions/domain.exception';
import { OperationMaterial } from './operation-material.entity';

/**
 * RouteStep entity - a single step in a technological route
 * Links an operation to a position in the route sequence
 */
export class RouteStep {
  private id?: number;
  private routeId: number;
  private operationId: number;
  private stepNumber: number; // Sequence order
  private description: string | null;
  private isRequired: boolean;
  private materials: OperationMaterial[];
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(props: {
    id?: number;
    routeId: number;
    operationId: number;
    stepNumber: number;
    description?: string | null;
    isRequired?: boolean;
    materials?: OperationMaterial[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.routeId = props.routeId;
    this.operationId = props.operationId;
    this.stepNumber = props.stepNumber;
    this.description = props.description ?? null;
    this.isRequired = props.isRequired ?? true;
    this.materials = props.materials ?? [];
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();

    this.validate();
  }

  /**
   * Factory method to create a new route step
   */
  static create(props: {
    routeId: number;
    operationId: number;
    stepNumber: number;
    description?: string | null;
    isRequired?: boolean;
    materials?: OperationMaterial[];
  }): RouteStep {
    return new RouteStep(props);
  }

  /**
   * Factory method to restore from database
   */
  static restore(props: {
    id: number;
    routeId: number;
    operationId: number;
    stepNumber: number;
    description: string | null;
    isRequired: boolean;
    materials: OperationMaterial[];
    createdAt: Date;
    updatedAt: Date;
  }): RouteStep {
    return new RouteStep(props);
  }

  /**
   * Validate invariants
   */
  private validate(): void {
    // Note: routeId can be 0 during creation before the route is persisted
    // The actual routeId will be set by the persistence layer when saving
    if (this.routeId < 0) {
      throw new DomainException('Route ID cannot be negative');
    }
    // Note: operationId can be 0 for material-only routes
    if (this.operationId < 0) {
      throw new DomainException('Operation ID cannot be negative');
    }
    if (this.stepNumber < 0) {
      throw new DomainException('Step number cannot be negative');
    }
  }

  /**
   * Update step information
   */
  updateInfo(props: {
    stepNumber?: number;
    description?: string | null;
    isRequired?: boolean;
  }): void {
    if (props.stepNumber !== undefined) {
      if (props.stepNumber < 0) {
        throw new DomainException('Step number cannot be negative');
      }
      this.stepNumber = props.stepNumber;
    }

    if (props.description !== undefined) {
      this.description = props.description;
    }

    if (props.isRequired !== undefined) {
      this.isRequired = props.isRequired;
    }

    this.updatedAt = new Date();
  }

  // Getters
  getId(): number | undefined {
    return this.id;
  }

  getRouteId(): number {
    return this.routeId;
  }

  getOperationId(): number {
    return this.operationId;
  }

  getStepNumber(): number {
    return this.stepNumber;
  }

  getDescription(): string | null {
    return this.description;
  }

  getIsRequired(): boolean {
    return this.isRequired;
  }

  getMaterials(): OperationMaterial[] {
    return [...this.materials];
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}

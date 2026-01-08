import { DomainException } from '../../../../common/exceptions/domain.exception';
import { RouteStep } from './route-step.entity';

/**
 * TechnologicalRoute entity - defines the sequence of operations for a product
 * Aggregate root that manages route steps
 */
export class TechnologicalRoute {
  private id?: number;
  private productId: number;
  private name: string;
  private description: string | null;
  private isActive: boolean;
  private steps: RouteStep[];
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(props: {
    id?: number;
    productId: number;
    name: string;
    description?: string | null;
    isActive?: boolean;
    steps?: RouteStep[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.productId = props.productId;
    this.name = props.name;
    this.description = props.description ?? null;
    this.isActive = props.isActive ?? true;
    this.steps = props.steps ?? [];
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();

    this.validate();
  }

  /**
   * Factory method to create a new technological route
   */
  static create(props: {
    productId: number;
    name: string;
    description?: string | null;
    isActive?: boolean;
  }): TechnologicalRoute {
    return new TechnologicalRoute(props);
  }

  /**
   * Factory method to restore from database
   */
  static restore(props: {
    id: number;
    productId: number;
    name: string;
    description: string | null;
    isActive: boolean;
    steps: RouteStep[];
    createdAt: Date;
    updatedAt: Date;
  }): TechnologicalRoute {
    return new TechnologicalRoute(props);
  }

  /**
   * Validate invariants
   */
  private validate(): void {
    if (this.productId <= 0) {
      throw new DomainException('Product ID must be positive');
    }
    if (!this.name || this.name.trim().length === 0) {
      throw new DomainException('Route name is required');
    }
  }

  /**
   * Add a step to the route
   */
  addStep(step: RouteStep): void {
    // Check for duplicate step numbers
    const exists = this.steps.some(s => s.getStepNumber() === step.getStepNumber());
    if (exists) {
      throw new DomainException(
        `Step number ${step.getStepNumber()} already exists`,
      );
    }

    this.steps.push(step);
    this.updatedAt = new Date();
  }

  /**
   * Remove a step from the route
   */
  removeStep(stepNumber: number): void {
    const index = this.steps.findIndex(s => s.getStepNumber() === stepNumber);
    if (index === -1) {
      throw new DomainException(`Step number ${stepNumber} not found`);
    }

    const step = this.steps[index];
    if (step.getIsRequired()) {
      throw new DomainException('Cannot remove required step');
    }

    this.steps.splice(index, 1);
    this.updatedAt = new Date();
  }

  /**
   * Get steps sorted by step number
   */
  getSortedSteps(): RouteStep[] {
    return [...this.steps].sort((a, b) => a.getStepNumber() - b.getStepNumber());
  }

  /**
   * Update route information
   */
  updateInfo(props: {
    name?: string;
    description?: string | null;
    isActive?: boolean;
  }): void {
    if (props.name !== undefined) {
      if (!props.name || props.name.trim().length === 0) {
        throw new DomainException('Route name cannot be empty');
      }
      this.name = props.name.trim();
    }

    if (props.description !== undefined) {
      this.description = props.description;
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

  getProductId(): number {
    return this.productId;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string | null {
    return this.description;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  getSteps(): RouteStep[] {
    return [...this.steps];
  }

  getStepByNumber(stepNumber: number): RouteStep | null {
    return this.steps.find(s => s.getStepNumber() === stepNumber) || null;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}

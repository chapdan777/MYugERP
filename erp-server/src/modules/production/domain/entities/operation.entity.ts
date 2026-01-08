import { DomainException } from '../../../../common/exceptions/domain.exception';

/**
 * Operation entity - represents a production operation
 * Examples: cutting, drilling, painting, assembly
 */
export class Operation {
  private id?: number;
  private code: string;
  private name: string;
  private description: string | null;
  private isActive: boolean;
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(props: {
    id?: number;
    code: string;
    name: string;
    description?: string | null;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.code = props.code;
    this.name = props.name;
    this.description = props.description ?? null;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();

    this.validate();
  }

  /**
   * Factory method to create a new operation
   */
  static create(props: {
    code: string;
    name: string;
    description?: string | null;
    isActive?: boolean;
  }): Operation {
    return new Operation(props);
  }

  /**
   * Factory method to restore from database
   */
  static restore(props: {
    id: number;
    code: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Operation {
    return new Operation(props);
  }

  /**
   * Validate operation invariants
   */
  private validate(): void {
    if (!this.code || this.code.trim().length === 0) {
      throw new DomainException('Operation code is required');
    }
    if (!this.name || this.name.trim().length === 0) {
      throw new DomainException('Operation name is required');
    }
  }

  /**
   * Update operation information
   */
  updateInfo(props: {
    name?: string;
    description?: string | null;
    isActive?: boolean;
  }): void {
    if (props.name !== undefined) {
      if (!props.name || props.name.trim().length === 0) {
        throw new DomainException('Operation name cannot be empty');
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

  /**
   * Activate operation
   */
  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Deactivate operation
   */
  deactivate(): void {
    this.isActive = false;
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

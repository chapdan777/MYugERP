/**
 * OrderPaymentAllocation Entity
 * 
 * Represents the allocation of a client's payment to a specific order
 * Part of the Accounting bounded context
 */
export class OrderPaymentAllocation {
  private constructor(
    private id: number | null,
    private clientId: number,
    private clientName: string,
    private orderId: number,
    private orderNumber: string,
    private allocatedAmount: number,
    private allocationDate: Date,
    private allocatedBy: number,
    private notes: string | null,
    private isActive: boolean,
    private createdAt: Date,
    private updatedAt: Date,
  ) {}

  /**
   * Create new OrderPaymentAllocation
   */
  static create(input: {
    clientId: number;
    clientName: string;
    orderId: number;
    orderNumber: string;
    allocatedAmount: number;
    allocationDate: Date;
    allocatedBy: number;
    notes?: string | null;
  }): OrderPaymentAllocation {
    const now = new Date();

    // Validations
    if (input.clientId <= 0) {
      throw new Error('Client ID must be positive');
    }

    if (!input.clientName || input.clientName.trim() === '') {
      throw new Error('Client name is required');
    }

    if (input.orderId <= 0) {
      throw new Error('Order ID must be positive');
    }

    if (!input.orderNumber || input.orderNumber.trim() === '') {
      throw new Error('Order number is required');
    }

    if (input.allocatedAmount <= 0) {
      throw new Error('Allocated amount must be positive');
    }

    if (input.allocatedBy <= 0) {
      throw new Error('Allocated by user ID must be positive');
    }

    return new OrderPaymentAllocation(
      null,
      input.clientId,
      input.clientName,
      input.orderId,
      input.orderNumber,
      input.allocatedAmount,
      input.allocationDate,
      input.allocatedBy,
      input.notes ?? null,
      true, // isActive
      now,
      now,
    );
  }

  /**
   * Restore OrderPaymentAllocation from database
   */
  static restore(data: {
    id: number;
    clientId: number;
    clientName: string;
    orderId: number;
    orderNumber: string;
    allocatedAmount: number;
    allocationDate: Date;
    allocatedBy: number;
    notes: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): OrderPaymentAllocation {
    return new OrderPaymentAllocation(
      data.id,
      data.clientId,
      data.clientName,
      data.orderId,
      data.orderNumber,
      data.allocatedAmount,
      data.allocationDate,
      data.allocatedBy,
      data.notes,
      data.isActive,
      data.createdAt,
      data.updatedAt,
    );
  }

  // Getters
  getId(): number | null {
    return this.id;
  }

  getClientId(): number {
    return this.clientId;
  }

  getClientName(): string {
    return this.clientName;
  }

  getOrderId(): number {
    return this.orderId;
  }

  getOrderNumber(): string {
    return this.orderNumber;
  }

  getAllocatedAmount(): number {
    return this.allocatedAmount;
  }

  getAllocationDate(): Date {
    return this.allocationDate;
  }

  getAllocatedBy(): number {
    return this.allocatedBy;
  }

  getNotes(): string | null {
    return this.notes;
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

  /**
   * Update notes
   */
  updateNotes(notes: string | null): void {
    this.notes = notes;
    this.updatedAt = new Date();
  }

  /**
   * Cancel allocation (soft delete)
   */
  cancel(): void {
    if (!this.isActive) {
      throw new Error('Allocation is already cancelled');
    }

    this.isActive = false;
    this.updatedAt = new Date();
  }

  /**
   * Reactivate cancelled allocation
   */
  reactivate(): void {
    if (this.isActive) {
      throw new Error('Allocation is already active');
    }

    this.isActive = true;
    this.updatedAt = new Date();
  }
}

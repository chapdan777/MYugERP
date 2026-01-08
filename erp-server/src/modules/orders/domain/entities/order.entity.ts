import { DomainException } from '../../../../common/exceptions/domain.exception';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { OrderSection } from './order-section.entity';

/**
 * Order aggregate root
 * Manages the complete order lifecycle including sections, items, status transitions, and locking
 */
export class Order {
  private id?: number;
  private orderNumber: string;
  private clientId: number;
  private clientName: string;
  private status: OrderStatus;
  private paymentStatus: PaymentStatus;
  private deadline: Date | null;
  private lockedBy: number | null;
  private lockedAt: Date | null;
  private totalAmount: number;
  private sections: OrderSection[];
  private notes: string | null;
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(props: {
    id?: number;
    orderNumber: string;
    clientId: number;
    clientName: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    deadline: Date | null;
    lockedBy: number | null;
    lockedAt: Date | null;
    totalAmount: number;
    sections: OrderSection[];
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.orderNumber = props.orderNumber;
    this.clientId = props.clientId;
    this.clientName = props.clientName;
    this.status = props.status;
    this.paymentStatus = props.paymentStatus;
    this.deadline = props.deadline;
    this.lockedBy = props.lockedBy;
    this.lockedAt = props.lockedAt;
    this.totalAmount = props.totalAmount;
    this.sections = props.sections;
    this.notes = props.notes;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Factory method to create a new Order
   */
  static create(props: {
    orderNumber: string;
    clientId: number;
    clientName: string;
    deadline?: Date | null;
    notes?: string | null;
  }): Order {
    if (!props.orderNumber || props.orderNumber.trim().length === 0) {
      throw new DomainException('Order number is required');
    }
    if (!props.clientId || props.clientId <= 0) {
      throw new DomainException('Valid client ID is required');
    }
    if (!props.clientName || props.clientName.trim().length === 0) {
      throw new DomainException('Client name is required');
    }

    const now = new Date();
    return new Order({
      orderNumber: props.orderNumber.trim(),
      clientId: props.clientId,
      clientName: props.clientName.trim(),
      status: OrderStatus.DRAFT,
      paymentStatus: PaymentStatus.UNPAID,
      deadline: props.deadline ?? null,
      lockedBy: null,
      lockedAt: null,
      totalAmount: 0,
      sections: [],
      notes: props.notes?.trim() || null,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Factory method to restore Order from database
   */
  static restore(props: {
    id: number;
    orderNumber: string;
    clientId: number;
    clientName: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    deadline: Date | null;
    lockedBy: number | null;
    lockedAt: Date | null;
    totalAmount: number;
    sections: OrderSection[];
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Order {
    return new Order(props);
  }

  /**
   * Add a section to the order
   */
  addSection(section: OrderSection): void {
    if (!this.canBeModified()) {
      throw new DomainException(
        `Cannot add section to order in status: ${this.status}`,
      );
    }

    const exists = this.sections.some(
      s => s.getSectionNumber() === section.getSectionNumber(),
    );
    if (exists) {
      throw new DomainException(
        `Section number ${section.getSectionNumber()} already exists`,
      );
    }

    this.sections.push(section);
    this.recalculateTotalAmount();
    this.updatedAt = new Date();
  }

  /**
   * Remove a section from the order
   */
  removeSection(sectionNumber: number): void {
    if (!this.canBeModified()) {
      throw new DomainException(
        `Cannot remove section from order in status: ${this.status}`,
      );
    }

    const index = this.sections.findIndex(
      s => s.getSectionNumber() === sectionNumber,
    );
    if (index === -1) {
      throw new DomainException(`Section number ${sectionNumber} not found`);
    }

    this.sections.splice(index, 1);
    this.recalculateTotalAmount();
    this.updatedAt = new Date();
  }

  /**
   * Change order status with validation
   */
  changeStatus(newStatus: OrderStatus): void {
    if (this.status === newStatus) {
      return;
    }

    // Validate state transitions
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.DRAFT]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [
        OrderStatus.IN_PRODUCTION,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.IN_PRODUCTION]: [OrderStatus.READY, OrderStatus.CANCELLED],
      [OrderStatus.READY]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    const allowedStatuses = validTransitions[this.status];
    if (!allowedStatuses.includes(newStatus)) {
      throw new DomainException(
        `Cannot transition from ${this.status} to ${newStatus}`,
      );
    }

    this.status = newStatus;
    this.updatedAt = new Date();
  }

  /**
   * Update payment status
   */
  updatePaymentStatus(paymentStatus: PaymentStatus): void {
    this.paymentStatus = paymentStatus;
    this.updatedAt = new Date();
  }

  /**
   * Lock the order for editing by a specific user
   */
  lock(userId: number): void {
    if (this.isLocked()) {
      if (this.lockedBy === userId) {
        // User already has the lock, just refresh the timestamp
        this.lockedAt = new Date();
        return;
      }
      throw new DomainException(
        `Order is already locked by user ${this.lockedBy}`,
      );
    }

    this.lockedBy = userId;
    this.lockedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Unlock the order
   */
  unlock(userId: number): void {
    if (!this.isLocked()) {
      return; // Already unlocked
    }

    if (this.lockedBy !== userId) {
      throw new DomainException(
        `Cannot unlock order locked by user ${this.lockedBy}`,
      );
    }

    this.lockedBy = null;
    this.lockedAt = null;
    this.updatedAt = new Date();
  }

  /**
   * Check if order is locked
   */
  isLocked(): boolean {
    return this.lockedBy !== null && this.lockedAt !== null;
  }

  /**
   * Check if order is locked by a specific user
   */
  isLockedBy(userId: number): boolean {
    return this.lockedBy === userId;
  }

  /**
   * Update order information
   */
  updateInfo(props: {
    clientName?: string;
    deadline?: Date | null;
    notes?: string | null;
  }): void {
    if (!this.canBeModified()) {
      throw new DomainException(
        `Cannot update order in status: ${this.status}`,
      );
    }

    if (props.clientName !== undefined) {
      if (!props.clientName || props.clientName.trim().length === 0) {
        throw new DomainException('Client name cannot be empty');
      }
      this.clientName = props.clientName.trim();
    }

    if (props.deadline !== undefined) {
      this.deadline = props.deadline;
    }

    if (props.notes !== undefined) {
      this.notes = props.notes?.trim() || null;
    }

    this.updatedAt = new Date();
  }

  /**
   * Check if order can be modified
   */
  canBeModified(): boolean {
    return (
      this.status === OrderStatus.DRAFT ||
      this.status === OrderStatus.CONFIRMED
    );
  }

  /**
   * Recalculate total amount from all sections
   */
  private recalculateTotalAmount(): void {
    this.totalAmount = this.sections.reduce(
      (sum, section) => sum + section.getTotalAmount(),
      0,
    );
  }

  /**
   * Calculate and update total amount
   */
  calculateTotalAmount(): number {
    this.recalculateTotalAmount();
    return this.totalAmount;
  }

  // Getters
  getId(): number | undefined {
    return this.id;
  }

  getOrderNumber(): string {
    return this.orderNumber;
  }

  getClientId(): number {
    return this.clientId;
  }

  getClientName(): string {
    return this.clientName;
  }

  getStatus(): OrderStatus {
    return this.status;
  }

  getPaymentStatus(): PaymentStatus {
    return this.paymentStatus;
  }

  getDeadline(): Date | null {
    return this.deadline;
  }

  getLockedBy(): number | null {
    return this.lockedBy;
  }

  getLockedAt(): Date | null {
    return this.lockedAt;
  }

  getTotalAmount(): number {
    return this.totalAmount;
  }

  getSections(): OrderSection[] {
    return [...this.sections];
  }

  getSectionByNumber(sectionNumber: number): OrderSection | null {
    return (
      this.sections.find(s => s.getSectionNumber() === sectionNumber) || null
    );
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

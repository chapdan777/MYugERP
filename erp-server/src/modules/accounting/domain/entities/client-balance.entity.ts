/**
 * ClientBalance Entity
 * 
 * Represents the aggregated balance for a client
 * Part of the Accounting bounded context
 */
export class ClientBalance {
  private constructor(
    private id: number | null,
    private clientId: number,
    private clientName: string,
    private totalPaid: number,
    private totalAllocated: number,
    private balance: number, // totalPaid - totalAllocated
    private lastPaymentDate: Date | null,
    private lastAllocationDate: Date | null,
    private createdAt: Date,
    private updatedAt: Date,
  ) {}

  /**
   * Create new ClientBalance
   */
  static create(input: {
    clientId: number;
    clientName: string;
  }): ClientBalance {
    const now = new Date();

    if (input.clientId <= 0) {
      throw new Error('Client ID must be positive');
    }

    if (!input.clientName || input.clientName.trim() === '') {
      throw new Error('Client name is required');
    }

    return new ClientBalance(
      null,
      input.clientId,
      input.clientName,
      0, // totalPaid
      0, // totalAllocated
      0, // balance
      null, // lastPaymentDate
      null, // lastAllocationDate
      now,
      now,
    );
  }

  /**
   * Restore ClientBalance from database
   */
  static restore(data: {
    id: number;
    clientId: number;
    clientName: string;
    totalPaid: number;
    totalAllocated: number;
    balance: number;
    lastPaymentDate: Date | null;
    lastAllocationDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): ClientBalance {
    return new ClientBalance(
      data.id,
      data.clientId,
      data.clientName,
      data.totalPaid,
      data.totalAllocated,
      data.balance,
      data.lastPaymentDate,
      data.lastAllocationDate,
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

  getTotalPaid(): number {
    return this.totalPaid;
  }

  getTotalAllocated(): number {
    return this.totalAllocated;
  }

  getBalance(): number {
    return this.balance;
  }

  getLastPaymentDate(): Date | null {
    return this.lastPaymentDate;
  }

  getLastAllocationDate(): Date | null {
    return this.lastAllocationDate;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  /**
   * Credit (add payment to balance)
   */
  credit(amount: number, paymentDate: Date): void {
    if (amount <= 0) {
      throw new Error('Credit amount must be positive');
    }

    this.totalPaid += amount;
    this.balance += amount;
    this.lastPaymentDate = paymentDate;
    this.updatedAt = new Date();
  }

  /**
   * Debit (allocate balance to order)
   */
  debit(amount: number, allocationDate: Date): void {
    if (amount <= 0) {
      throw new Error('Debit amount must be positive');
    }

    if (amount > this.balance) {
      throw new Error(
        `Insufficient balance. Available: ${this.balance}, Required: ${amount}`,
      );
    }

    this.totalAllocated += amount;
    this.balance -= amount;
    this.lastAllocationDate = allocationDate;
    this.updatedAt = new Date();
  }

  /**
   * Reverse debit (when allocation is cancelled)
   */
  reverseDebit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Reverse debit amount must be positive');
    }

    this.totalAllocated -= amount;
    this.balance += amount;
    this.updatedAt = new Date();
  }

  /**
   * Update client name
   */
  updateClientName(clientName: string): void {
    if (!clientName || clientName.trim() === '') {
      throw new Error('Client name is required');
    }

    this.clientName = clientName;
    this.updatedAt = new Date();
  }

  /**
   * Check if has available balance
   */
  hasAvailableBalance(amount: number): boolean {
    return this.balance >= amount;
  }
}

/**
 * Payment Entity
 * 
 * Represents a payment received from a client
 * Part of the Accounting bounded context
 */
export class Payment {
  private constructor(
    private id: number | null,
    private clientId: number,
    private clientName: string,
    private amount: number,
    private paymentMethod: PaymentMethod,
    private paymentDate: Date,
    private referenceNumber: string | null,
    private notes: string | null,
    private registeredBy: number,
    private registeredAt: Date,
    private createdAt: Date,
    private updatedAt: Date,
  ) {}

  /**
   * Create new Payment
   */
  static create(input: {
    clientId: number;
    clientName: string;
    amount: number;
    paymentMethod: PaymentMethod;
    paymentDate: Date;
    referenceNumber?: string | null;
    notes?: string | null;
    registeredBy: number;
  }): Payment {
    const now = new Date();

    // Validate inputs
    if (input.clientId <= 0) {
      throw new Error('Client ID must be positive');
    }

    if (!input.clientName || input.clientName.trim() === '') {
      throw new Error('Client name is required');
    }

    if (input.amount <= 0) {
      throw new Error('Payment amount must be positive');
    }

    if (input.registeredBy <= 0) {
      throw new Error('Registered by user ID must be positive');
    }

    return new Payment(
      null,
      input.clientId,
      input.clientName,
      input.amount,
      input.paymentMethod,
      input.paymentDate,
      input.referenceNumber ?? null,
      input.notes ?? null,
      input.registeredBy,
      now,
      now,
      now,
    );
  }

  /**
   * Restore Payment from database
   */
  static restore(data: {
    id: number;
    clientId: number;
    clientName: string;
    amount: number;
    paymentMethod: PaymentMethod;
    paymentDate: Date;
    referenceNumber: string | null;
    notes: string | null;
    registeredBy: number;
    registeredAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }): Payment {
    return new Payment(
      data.id,
      data.clientId,
      data.clientName,
      data.amount,
      data.paymentMethod,
      data.paymentDate,
      data.referenceNumber,
      data.notes,
      data.registeredBy,
      data.registeredAt,
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

  getAmount(): number {
    return this.amount;
  }

  getPaymentMethod(): PaymentMethod {
    return this.paymentMethod;
  }

  getPaymentDate(): Date {
    return this.paymentDate;
  }

  getReferenceNumber(): string | null {
    return this.referenceNumber;
  }

  getNotes(): string | null {
    return this.notes;
  }

  getRegisteredBy(): number {
    return this.registeredBy;
  }

  getRegisteredAt(): Date {
    return this.registeredAt;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  /**
   * Update payment notes
   */
  updateNotes(notes: string | null): void {
    this.notes = notes;
    this.updatedAt = new Date();
  }

  /**
   * Update reference number
   */
  updateReferenceNumber(referenceNumber: string | null): void {
    this.referenceNumber = referenceNumber;
    this.updatedAt = new Date();
  }
}

/**
 * Payment Method enum
 */
export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  CREDIT_CARD = 'CREDIT_CARD',
  ONLINE_PAYMENT = 'ONLINE_PAYMENT',
  OTHER = 'OTHER',
}

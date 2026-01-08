import { DomainException } from '../../../../common/exceptions/domain.exception';

/**
 * Money value object
 * Represents a monetary amount with proper equality and validation
 */
export class Money {
  private readonly amount: number;
  private readonly currency: string;

  private constructor(amount: number, currency: string = 'RUB') {
    if (amount < 0) {
      throw new DomainException('Money amount cannot be negative');
    }
    if (!Number.isFinite(amount)) {
      throw new DomainException('Money amount must be a finite number');
    }
    if (!currency || currency.trim().length === 0) {
      throw new DomainException('Currency is required');
    }

    // Round to 2 decimal places for monetary precision
    this.amount = Math.round(amount * 100) / 100;
    this.currency = currency.toUpperCase().trim();
  }

  static create(amount: number, currency: string = 'RUB'): Money {
    return new Money(amount, currency);
  }

  static zero(currency: string = 'RUB'): Money {
    return new Money(0, currency);
  }

  /**
   * Add another Money value
   */
  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  /**
   * Subtract another Money value
   */
  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    const result = this.amount - other.amount;
    if (result < 0) {
      throw new DomainException('Subtraction would result in negative amount');
    }
    return new Money(result, this.currency);
  }

  /**
   * Multiply by a scalar
   */
  multiply(multiplier: number): Money {
    if (!Number.isFinite(multiplier)) {
      throw new DomainException('Multiplier must be a finite number');
    }
    if (multiplier < 0) {
      throw new DomainException('Multiplier cannot be negative');
    }
    return new Money(this.amount * multiplier, this.currency);
  }

  /**
   * Divide by a scalar
   */
  divide(divisor: number): Money {
    if (!Number.isFinite(divisor)) {
      throw new DomainException('Divisor must be a finite number');
    }
    if (divisor === 0) {
      throw new DomainException('Cannot divide by zero');
    }
    if (divisor < 0) {
      throw new DomainException('Divisor cannot be negative');
    }
    return new Money(this.amount / divisor, this.currency);
  }

  /**
   * Check if this Money is greater than another
   */
  isGreaterThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this.amount > other.amount;
  }

  /**
   * Check if this Money is less than another
   */
  isLessThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this.amount < other.amount;
  }

  /**
   * Check if this Money equals another
   */
  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  /**
   * Check if amount is zero
   */
  isZero(): boolean {
    return this.amount === 0;
  }

  /**
   * Get amount as number
   */
  getAmount(): number {
    return this.amount;
  }

  /**
   * Get currency code
   */
  getCurrency(): string {
    return this.currency;
  }

  /**
   * Format money for display
   */
  format(): string {
    return `${this.amount.toFixed(2)} ${this.currency}`;
  }

  /**
   * Convert to plain object for persistence
   */
  toJSON(): { amount: number; currency: string } {
    return {
      amount: this.amount,
      currency: this.currency,
    };
  }

  /**
   * Ensure two Money objects have the same currency
   */
  private ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new DomainException(
        `Cannot operate on different currencies: ${this.currency} and ${other.currency}`,
      );
    }
  }
}

import { DomainException } from '../../../../common/exceptions/domain.exception';

/**
 * DateRange value object
 * Represents a period between two dates with validation
 */
export class DateRange {
  private readonly startDate: Date;
  private readonly endDate: Date;

  private constructor(startDate: Date, endDate: Date) {
    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
      throw new DomainException('Start date must be a valid date');
    }
    if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
      throw new DomainException('End date must be a valid date');
    }
    if (startDate > endDate) {
      throw new DomainException('Start date cannot be after end date');
    }

    this.startDate = new Date(startDate);
    this.endDate = new Date(endDate);
  }

  static create(startDate: Date, endDate: Date): DateRange {
    return new DateRange(startDate, endDate);
  }

  /**
   * Create a DateRange from string dates (ISO format)
   */
  static fromStrings(startDate: string, endDate: string): DateRange {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return new DateRange(start, end);
  }

  /**
   * Create a DateRange for a specific number of days from a start date
   */
  static fromDuration(startDate: Date, durationDays: number): DateRange {
    if (durationDays < 0) {
      throw new DomainException('Duration cannot be negative');
    }
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);
    return new DateRange(startDate, endDate);
  }

  /**
   * Get the duration in days
   */
  getDurationInDays(): number {
    const diffTime = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get the duration in hours
   */
  getDurationInHours(): number {
    const diffTime = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60));
  }

  /**
   * Check if a date falls within this range
   */
  contains(date: Date): boolean {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new DomainException('Invalid date provided');
    }
    return date >= this.startDate && date <= this.endDate;
  }

  /**
   * Check if this range overlaps with another
   */
  overlaps(other: DateRange): boolean {
    return this.startDate <= other.endDate && this.endDate >= other.startDate;
  }

  /**
   * Check if this range fully contains another range
   */
  fullyContains(other: DateRange): boolean {
    return this.startDate <= other.startDate && this.endDate >= other.endDate;
  }

  /**
   * Check if this range equals another
   */
  equals(other: DateRange): boolean {
    return (
      this.startDate.getTime() === other.startDate.getTime() &&
      this.endDate.getTime() === other.endDate.getTime()
    );
  }

  /**
   * Check if the range has expired (end date is in the past)
   */
  hasExpired(): boolean {
    return this.endDate < new Date();
  }

  /**
   * Check if the range is currently active
   */
  isActive(): boolean {
    const now = new Date();
    return this.startDate <= now && this.endDate >= now;
  }

  /**
   * Check if the range is in the future
   */
  isFuture(): boolean {
    return this.startDate > new Date();
  }

  /**
   * Get start date
   */
  getStartDate(): Date {
    return new Date(this.startDate);
  }

  /**
   * Get end date
   */
  getEndDate(): Date {
    return new Date(this.endDate);
  }

  /**
   * Format for display
   */
  format(): string {
    return `${this.formatDate(this.startDate)} - ${this.formatDate(this.endDate)}`;
  }

  /**
   * Convert to plain object for persistence
   */
  toJSON(): { startDate: Date; endDate: Date } {
    return {
      startDate: this.startDate,
      endDate: this.endDate,
    };
  }

  /**
   * Helper to format date as YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

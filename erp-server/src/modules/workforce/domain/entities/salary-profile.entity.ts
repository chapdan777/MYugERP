/**
 * SalaryProfile Entity
 * 
 * Represents a worker's salary configuration
 * Supports three types: piece-rate (сдельная), hourly (повременная), and fixed salary (оклад)
 * Business rule: Only one active profile per worker at a time
 */
export class SalaryProfile {
  private constructor(
    private id: number | null,
    private workerId: number,
    private workerName: string,
    private salaryType: SalaryType,
    private hourlyRate: number | null, // For hourly workers
    private fixedMonthlySalary: number | null, // For salaried workers
    private pieceRateMultiplier: number, // Multiplier for piece rates (default 1.0)
    private effectiveFrom: Date,
    private effectiveTo: Date | null,
    private isActive: boolean,
    private notes: string | null,
    private createdAt: Date,
    private updatedAt: Date,
    private createdBy: number,
  ) {}

  /**
   * Create new SalaryProfile
   */
  static create(input: {
    workerId: number;
    workerName: string;
    salaryType: SalaryType;
    hourlyRate?: number | null;
    fixedMonthlySalary?: number | null;
    pieceRateMultiplier?: number;
    effectiveFrom: Date;
    effectiveTo?: Date | null;
    notes?: string | null;
    createdBy: number;
  }): SalaryProfile {
    const now = new Date();

    // Validate inputs based on salary type
    if (input.salaryType === SalaryType.HOURLY) {
      if (!input.hourlyRate || input.hourlyRate <= 0) {
        throw new Error('Hourly rate is required and must be positive for hourly salary type');
      }
    }

    if (input.salaryType === SalaryType.FIXED) {
      if (!input.fixedMonthlySalary || input.fixedMonthlySalary <= 0) {
        throw new Error('Fixed monthly salary is required and must be positive for fixed salary type');
      }
    }

    if (input.salaryType === SalaryType.PIECE_RATE) {
      const multiplier = input.pieceRateMultiplier ?? 1.0;
      if (multiplier <= 0) {
        throw new Error('Piece rate multiplier must be positive');
      }
    }

    if (input.workerId <= 0) {
      throw new Error('Worker ID must be positive');
    }

    if (!input.workerName || input.workerName.trim() === '') {
      throw new Error('Worker name is required');
    }

    if (input.effectiveTo && input.effectiveTo <= input.effectiveFrom) {
      throw new Error('Effective to date must be after effective from date');
    }

    return new SalaryProfile(
      null,
      input.workerId,
      input.workerName,
      input.salaryType,
      input.salaryType === SalaryType.HOURLY ? input.hourlyRate! : null,
      input.salaryType === SalaryType.FIXED ? input.fixedMonthlySalary! : null,
      input.salaryType === SalaryType.PIECE_RATE ? (input.pieceRateMultiplier ?? 1.0) : 1.0,
      input.effectiveFrom,
      input.effectiveTo ?? null,
      true,
      input.notes ?? null,
      now,
      now,
      input.createdBy,
    );
  }

  /**
   * Restore SalaryProfile from database
   */
  static restore(data: {
    id: number;
    workerId: number;
    workerName: string;
    salaryType: SalaryType;
    hourlyRate: number | null;
    fixedMonthlySalary: number | null;
    pieceRateMultiplier: number;
    effectiveFrom: Date;
    effectiveTo: Date | null;
    isActive: boolean;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    createdBy: number;
  }): SalaryProfile {
    return new SalaryProfile(
      data.id,
      data.workerId,
      data.workerName,
      data.salaryType,
      data.hourlyRate,
      data.fixedMonthlySalary,
      data.pieceRateMultiplier,
      data.effectiveFrom,
      data.effectiveTo,
      data.isActive,
      data.notes,
      data.createdAt,
      data.updatedAt,
      data.createdBy,
    );
  }

  // Getters
  getId(): number | null {
    return this.id;
  }

  getWorkerId(): number {
    return this.workerId;
  }

  getWorkerName(): string {
    return this.workerName;
  }

  getSalaryType(): SalaryType {
    return this.salaryType;
  }

  getHourlyRate(): number | null {
    return this.hourlyRate;
  }

  getFixedMonthlySalary(): number | null {
    return this.fixedMonthlySalary;
  }

  getPieceRateMultiplier(): number {
    return this.pieceRateMultiplier;
  }

  getEffectiveFrom(): Date {
    return this.effectiveFrom;
  }

  getEffectiveTo(): Date | null {
    return this.effectiveTo;
  }

  isActiveProfile(): boolean {
    return this.isActive;
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

  getCreatedBy(): number {
    return this.createdBy;
  }

  /**
   * Check if profile is currently effective
   */
  isCurrentlyEffective(): boolean {
    if (!this.isActive) {
      return false;
    }

    const now = new Date();

    if (now < this.effectiveFrom) {
      return false;
    }

    if (this.effectiveTo && now > this.effectiveTo) {
      return false;
    }

    return true;
  }

  /**
   * Update hourly rate
   */
  updateHourlyRate(newRate: number): void {
    if (this.salaryType !== SalaryType.HOURLY) {
      throw new Error('Can only update hourly rate for hourly salary type');
    }

    if (newRate <= 0) {
      throw new Error('Hourly rate must be positive');
    }

    this.hourlyRate = newRate;
    this.updatedAt = new Date();
  }

  /**
   * Update fixed monthly salary
   */
  updateFixedMonthlySalary(newSalary: number): void {
    if (this.salaryType !== SalaryType.FIXED) {
      throw new Error('Can only update fixed salary for fixed salary type');
    }

    if (newSalary <= 0) {
      throw new Error('Fixed monthly salary must be positive');
    }

    this.fixedMonthlySalary = newSalary;
    this.updatedAt = new Date();
  }

  /**
   * Update piece rate multiplier
   */
  updatePieceRateMultiplier(newMultiplier: number): void {
    if (this.salaryType !== SalaryType.PIECE_RATE) {
      throw new Error('Can only update multiplier for piece-rate salary type');
    }

    if (newMultiplier <= 0) {
      throw new Error('Piece rate multiplier must be positive');
    }

    this.pieceRateMultiplier = newMultiplier;
    this.updatedAt = new Date();
  }

  /**
   * Update effective dates
   */
  updateEffectiveDates(effectiveFrom: Date, effectiveTo: Date | null): void {
    if (effectiveTo && effectiveTo <= effectiveFrom) {
      throw new Error('Effective to date must be after effective from date');
    }

    this.effectiveFrom = effectiveFrom;
    this.effectiveTo = effectiveTo;
    this.updatedAt = new Date();
  }

  /**
   * Deactivate profile
   */
  deactivate(): void {
    if (!this.isActive) {
      throw new Error('Profile is already inactive');
    }

    this.isActive = false;
    this.updatedAt = new Date();
  }

  /**
   * Reactivate profile
   */
  reactivate(): void {
    if (this.isActive) {
      throw new Error('Profile is already active');
    }

    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Update notes
   */
  updateNotes(notes: string | null): void {
    this.notes = notes;
    this.updatedAt = new Date();
  }

  /**
   * Terminate profile (set effective to date to now)
   */
  terminate(): void {
    const now = new Date();

    if (this.effectiveTo && this.effectiveTo < now) {
      throw new Error('Profile is already terminated');
    }

    this.effectiveTo = now;
    this.isActive = false;
    this.updatedAt = now;
  }

  /**
   * Calculate salary for a given period based on salary type
   */
  calculateSalary(input: {
    hoursWorked?: number;
    pieceRateTotal?: number;
    daysInMonth?: number;
    workedDays?: number;
  }): number {
    if (!this.isActive) {
      throw new Error('Cannot calculate salary for inactive profile');
    }

    switch (this.salaryType) {
      case SalaryType.PIECE_RATE:
        if (input.pieceRateTotal === undefined) {
          throw new Error('Piece rate total is required for piece-rate salary calculation');
        }
        return input.pieceRateTotal * this.pieceRateMultiplier;

      case SalaryType.HOURLY:
        if (input.hoursWorked === undefined) {
          throw new Error('Hours worked is required for hourly salary calculation');
        }
        if (!this.hourlyRate) {
          throw new Error('Hourly rate is not set');
        }
        return input.hoursWorked * this.hourlyRate;

      case SalaryType.FIXED:
        if (!this.fixedMonthlySalary) {
          throw new Error('Fixed monthly salary is not set');
        }
        // If worked days provided, calculate pro-rated salary
        if (input.daysInMonth && input.workedDays !== undefined) {
          return (this.fixedMonthlySalary / input.daysInMonth) * input.workedDays;
        }
        return this.fixedMonthlySalary;

      default:
        throw new Error(`Unknown salary type: ${this.salaryType}`);
    }
  }

  /**
   * Get profile summary for display
   */
  getSummary(): string {
    switch (this.salaryType) {
      case SalaryType.PIECE_RATE:
        return `Piece-rate (multiplier: ${this.pieceRateMultiplier}x)`;
      case SalaryType.HOURLY:
        return `Hourly (${this.hourlyRate}/hour)`;
      case SalaryType.FIXED:
        return `Fixed (${this.fixedMonthlySalary}/month)`;
      default:
        return 'Unknown';
    }
  }
}

/**
 * Salary Type enum
 */
export enum SalaryType {
  PIECE_RATE = 'PIECE_RATE',   // сдельная - paid per piece/task completed
  HOURLY = 'HOURLY',           // повременная - paid per hour worked
  FIXED = 'FIXED',             // оклад - fixed monthly salary
}

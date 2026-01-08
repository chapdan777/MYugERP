/**
 * WorkerQualification Entity
 * 
 * Represents a worker's certification or skill for performing specific operations
 */
export class WorkerQualification {
  private constructor(
    private id: number | null,
    private workerId: number,
    private operationId: number,
    private operationName: string,
    private certificationLevel: CertificationLevel,
    private certifiedAt: Date,
    private expiresAt: Date | null,
    private certifiedBy: number | null, // User ID who certified
    private notes: string | null,
    private isActive: boolean,
    private createdAt: Date,
    private updatedAt: Date,
  ) {}

  /**
   * Create new WorkerQualification
   */
  static create(input: {
    workerId: number;
    operationId: number;
    operationName: string;
    certificationLevel: CertificationLevel;
    certifiedAt: Date;
    expiresAt: Date | null;
    certifiedBy: number | null;
    notes: string | null;
  }): WorkerQualification {
    const now = new Date();

    // Validate inputs
    if (input.workerId <= 0) {
      throw new Error('Worker ID must be positive');
    }
    if (input.operationId <= 0) {
      throw new Error('Operation ID must be positive');
    }
    if (!input.operationName || input.operationName.trim() === '') {
      throw new Error('Operation name is required');
    }
    if (input.expiresAt && input.expiresAt <= input.certifiedAt) {
      throw new Error('Expiration date must be after certification date');
    }

    return new WorkerQualification(
      null,
      input.workerId,
      input.operationId,
      input.operationName,
      input.certificationLevel,
      input.certifiedAt,
      input.expiresAt,
      input.certifiedBy,
      input.notes,
      true,
      now,
      now,
    );
  }

  /**
   * Restore WorkerQualification from database
   */
  static restore(data: {
    id: number;
    workerId: number;
    operationId: number;
    operationName: string;
    certificationLevel: CertificationLevel;
    certifiedAt: Date;
    expiresAt: Date | null;
    certifiedBy: number | null;
    notes: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): WorkerQualification {
    return new WorkerQualification(
      data.id,
      data.workerId,
      data.operationId,
      data.operationName,
      data.certificationLevel,
      data.certifiedAt,
      data.expiresAt,
      data.certifiedBy,
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

  getWorkerId(): number {
    return this.workerId;
  }

  getOperationId(): number {
    return this.operationId;
  }

  getOperationName(): string {
    return this.operationName;
  }

  getCertificationLevel(): CertificationLevel {
    return this.certificationLevel;
  }

  getCertifiedAt(): Date {
    return this.certifiedAt;
  }

  getExpiresAt(): Date | null {
    return this.expiresAt;
  }

  getCertifiedBy(): number | null {
    return this.certifiedBy;
  }

  getNotes(): string | null {
    return this.notes;
  }

  isActiveQualification(): boolean {
    return this.isActive;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  /**
   * Check if qualification is currently valid
   */
  isValid(): boolean {
    if (!this.isActive) {
      return false;
    }

    // Check if expired
    if (this.expiresAt) {
      const now = new Date();
      if (now > this.expiresAt) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if qualification is expiring soon (within given days)
   */
  isExpiringSoon(withinDays: number): boolean {
    if (!this.expiresAt || !this.isActive) {
      return false;
    }

    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (this.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysUntilExpiry > 0 && daysUntilExpiry <= withinDays;
  }

  /**
   * Upgrade certification level
   */
  upgradeCertificationLevel(
    newLevel: CertificationLevel,
    upgradedBy: number,
  ): void {
    if (!this.isActive) {
      throw new Error('Cannot upgrade inactive qualification');
    }

    // Validate level upgrade (can only go up)
    const currentLevelValue = this.getLevelValue(this.certificationLevel);
    const newLevelValue = this.getLevelValue(newLevel);

    if (newLevelValue <= currentLevelValue) {
      throw new Error('New certification level must be higher than current level');
    }

    this.certificationLevel = newLevel;
    this.certifiedBy = upgradedBy;
    this.certifiedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Renew qualification (extend expiration date)
   */
  renew(newExpirationDate: Date, renewedBy: number): void {
    if (!this.isActive) {
      throw new Error('Cannot renew inactive qualification');
    }

    const now = new Date();
    if (newExpirationDate <= now) {
      throw new Error('New expiration date must be in the future');
    }

    this.expiresAt = newExpirationDate;
    this.certifiedBy = renewedBy;
    this.updatedAt = now;
  }

  /**
   * Deactivate qualification
   */
  deactivate(): void {
    if (!this.isActive) {
      throw new Error('Qualification is already inactive');
    }

    this.isActive = false;
    this.updatedAt = new Date();
  }

  /**
   * Reactivate qualification
   */
  reactivate(): void {
    if (this.isActive) {
      throw new Error('Qualification is already active');
    }

    // Check if expired
    if (this.expiresAt) {
      const now = new Date();
      if (now > this.expiresAt) {
        throw new Error('Cannot reactivate expired qualification. Please renew first.');
      }
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
   * Helper: Get numeric value for certification level (for comparison)
   */
  private getLevelValue(level: CertificationLevel): number {
    switch (level) {
      case CertificationLevel.TRAINEE:
        return 1;
      case CertificationLevel.JUNIOR:
        return 2;
      case CertificationLevel.INTERMEDIATE:
        return 3;
      case CertificationLevel.SENIOR:
        return 4;
      case CertificationLevel.MASTER:
        return 5;
      default:
        return 0;
    }
  }
}

/**
 * Certification Level enum
 */
export enum CertificationLevel {
  TRAINEE = 'TRAINEE',           // Learning, requires supervision
  JUNIOR = 'JUNIOR',             // Can perform basic tasks independently
  INTERMEDIATE = 'INTERMEDIATE', // Proficient, can handle complex tasks
  SENIOR = 'SENIOR',             // Expert, can train others
  MASTER = 'MASTER',             // Master craftsman, highest skill level
}

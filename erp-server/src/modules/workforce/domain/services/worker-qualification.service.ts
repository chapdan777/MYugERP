import { Injectable, Inject } from '@nestjs/common';
import {
  WorkerQualification,
  CertificationLevel,
} from '../entities/worker-qualification.entity';
import {
  IWorkerQualificationRepository,
  WORKER_QUALIFICATION_REPOSITORY,
} from '../repositories/worker-qualification.repository.interface';

/**
 * Worker Qualification Management Service
 * 
 * Provides business logic for managing worker qualifications, certifications,
 * renewals, and validation
 */
@Injectable()
export class WorkerQualificationService {
  constructor(
    @Inject(WORKER_QUALIFICATION_REPOSITORY)
    private readonly qualificationRepository: IWorkerQualificationRepository,
  ) {}

  /**
   * Certify a worker for an operation
   */
  async certifyWorker(input: {
    workerId: number;
    operationId: number;
    operationName: string;
    certificationLevel: CertificationLevel;
    certifiedBy: number;
    expiresAt: Date | null;
    notes?: string | null;
  }): Promise<WorkerQualification> {
    // Check if worker already has qualification for this operation
    const existingQualifications = await this.qualificationRepository.findByWorkerIdAndOperationId(
      input.workerId,
      input.operationId,
    );

    // Deactivate any existing active qualifications (worker can only have one active per operation)
    for (const existing of existingQualifications) {
      if (existing.isActiveQualification()) {
        existing.deactivate();
        await this.qualificationRepository.save(existing);
      }
    }

    // Create new qualification
    const qualification = WorkerQualification.create({
      workerId: input.workerId,
      operationId: input.operationId,
      operationName: input.operationName,
      certificationLevel: input.certificationLevel,
      certifiedAt: new Date(),
      expiresAt: input.expiresAt,
      certifiedBy: input.certifiedBy,
      notes: input.notes ?? null,
    });

    return await this.qualificationRepository.save(qualification);
  }

  /**
   * Upgrade worker's certification level
   */
  async upgradeQualification(
    qualificationId: number,
    newLevel: CertificationLevel,
    upgradedBy: number,
  ): Promise<WorkerQualification> {
    const qualification = await this.qualificationRepository.findById(qualificationId);
    if (!qualification) {
      throw new Error(`Qualification with ID ${qualificationId} not found`);
    }

    qualification.upgradeCertificationLevel(newLevel, upgradedBy);
    return await this.qualificationRepository.save(qualification);
  }

  /**
   * Renew a qualification (extend expiration date)
   */
  async renewQualification(
    qualificationId: number,
    newExpirationDate: Date,
    renewedBy: number,
  ): Promise<WorkerQualification> {
    const qualification = await this.qualificationRepository.findById(qualificationId);
    if (!qualification) {
      throw new Error(`Qualification with ID ${qualificationId} not found`);
    }

    qualification.renew(newExpirationDate, renewedBy);
    return await this.qualificationRepository.save(qualification);
  }

  /**
   * Deactivate a qualification
   */
  async deactivateQualification(qualificationId: number): Promise<WorkerQualification> {
    const qualification = await this.qualificationRepository.findById(qualificationId);
    if (!qualification) {
      throw new Error(`Qualification with ID ${qualificationId} not found`);
    }

    qualification.deactivate();
    return await this.qualificationRepository.save(qualification);
  }

  /**
   * Reactivate a qualification
   */
  async reactivateQualification(qualificationId: number): Promise<WorkerQualification> {
    const qualification = await this.qualificationRepository.findById(qualificationId);
    if (!qualification) {
      throw new Error(`Qualification with ID ${qualificationId} not found`);
    }

    qualification.reactivate();
    return await this.qualificationRepository.save(qualification);
  }

  /**
   * Update qualification notes
   */
  async updateQualificationNotes(
    qualificationId: number,
    notes: string | null,
  ): Promise<WorkerQualification> {
    const qualification = await this.qualificationRepository.findById(qualificationId);
    if (!qualification) {
      throw new Error(`Qualification with ID ${qualificationId} not found`);
    }

    qualification.updateNotes(notes);
    return await this.qualificationRepository.save(qualification);
  }

  /**
   * Get all qualifications for a worker
   */
  async getWorkerQualifications(workerId: number): Promise<WorkerQualification[]> {
    return await this.qualificationRepository.findByWorkerId(workerId);
  }

  /**
   * Get active qualifications for a worker
   */
  async getActiveWorkerQualifications(workerId: number): Promise<WorkerQualification[]> {
    return await this.qualificationRepository.findActiveByWorkerId(workerId);
  }

  /**
   * Get valid (active and not expired) qualification for worker and operation
   */
  async getValidQualification(
    workerId: number,
    operationId: number,
  ): Promise<WorkerQualification | null> {
    return await this.qualificationRepository.findValidByWorkerIdAndOperationId(
      workerId,
      operationId,
    );
  }

  /**
   * Check if worker is qualified for an operation
   */
  async isWorkerQualified(
    workerId: number,
    operationId: number,
    minimumLevel?: CertificationLevel,
  ): Promise<boolean> {
    const qualification = await this.getValidQualification(workerId, operationId);

    if (!qualification || !qualification.isValid()) {
      return false;
    }

    // If minimum level is specified, check if worker meets it
    if (minimumLevel) {
      return this.meetsMinimumLevel(qualification.getCertificationLevel(), minimumLevel);
    }

    return true;
  }

  /**
   * Get all workers qualified for an operation
   */
  async getQualifiedWorkers(
    operationId: number,
    minimumLevel?: CertificationLevel,
  ): Promise<WorkerQualification[]> {
    const allQualifications = await this.qualificationRepository.findByOperationId(operationId);

    // Filter to valid qualifications
    let validQualifications = allQualifications.filter(q => q.isValid());

    // Filter by minimum level if specified
    if (minimumLevel) {
      validQualifications = validQualifications.filter(q =>
        this.meetsMinimumLevel(q.getCertificationLevel(), minimumLevel),
      );
    }

    return validQualifications;
  }

  /**
   * Get qualifications expiring soon
   */
  async getExpiringSoonQualifications(withinDays: number): Promise<WorkerQualification[]> {
    return await this.qualificationRepository.findExpiringSoon(withinDays);
  }

  /**
   * Get expired qualifications
   */
  async getExpiredQualifications(): Promise<WorkerQualification[]> {
    return await this.qualificationRepository.findExpired();
  }

  /**
   * Get qualification statistics for a worker
   */
  async getWorkerQualificationStats(workerId: number): Promise<{
    total: number;
    active: number;
    expired: number;
    expiringSoon: number;
    byLevel: Record<CertificationLevel, number>;
  }> {
    const qualifications = await this.qualificationRepository.findByWorkerId(workerId);

    const stats = {
      total: qualifications.length,
      active: 0,
      expired: 0,
      expiringSoon: 0,
      byLevel: {
        [CertificationLevel.TRAINEE]: 0,
        [CertificationLevel.JUNIOR]: 0,
        [CertificationLevel.INTERMEDIATE]: 0,
        [CertificationLevel.SENIOR]: 0,
        [CertificationLevel.MASTER]: 0,
      },
    };

    for (const qual of qualifications) {
      if (qual.isValid()) {
        stats.active++;
      }

      if (qual.isActiveQualification() && !qual.isValid()) {
        stats.expired++;
      }

      if (qual.isExpiringSoon(30)) {
        stats.expiringSoon++;
      }

      stats.byLevel[qual.getCertificationLevel()]++;
    }

    return stats;
  }

  /**
   * Bulk renew qualifications
   */
  async bulkRenewQualifications(
    qualificationIds: number[],
    newExpirationDate: Date,
    renewedBy: number,
  ): Promise<WorkerQualification[]> {
    const renewed: WorkerQualification[] = [];

    for (const id of qualificationIds) {
      try {
        const qualification = await this.renewQualification(id, newExpirationDate, renewedBy);
        renewed.push(qualification);
      } catch (error) {
        // Log error but continue with other qualifications
        console.error(`Failed to renew qualification ${id}:`, error);
      }
    }

    return renewed;
  }

  /**
   * Helper: Check if certification level meets minimum requirement
   */
  private meetsMinimumLevel(
    actualLevel: CertificationLevel,
    minimumLevel: CertificationLevel,
  ): boolean {
    const levelValues = {
      [CertificationLevel.TRAINEE]: 1,
      [CertificationLevel.JUNIOR]: 2,
      [CertificationLevel.INTERMEDIATE]: 3,
      [CertificationLevel.SENIOR]: 4,
      [CertificationLevel.MASTER]: 5,
    };

    return levelValues[actualLevel] >= levelValues[minimumLevel];
  }

  /**
   * Get recommended certification path for a worker
   */
  async getRecommendedCertificationPath(
    workerId: number,
  ): Promise<{
    currentQualifications: WorkerQualification[];
    upgradeOpportunities: {
      qualificationId: number;
      operationName: string;
      currentLevel: CertificationLevel;
      nextLevel: CertificationLevel;
    }[];
    missingOperations: number[];
  }> {
    const qualifications = await this.getActiveWorkerQualifications(workerId);

    const upgradeOpportunities = qualifications
      .filter(q => q.getCertificationLevel() !== CertificationLevel.MASTER)
      .map(q => ({
        qualificationId: q.getId()!,
        operationName: q.getOperationName(),
        currentLevel: q.getCertificationLevel(),
        nextLevel: this.getNextLevel(q.getCertificationLevel()),
      }));

    return {
      currentQualifications: qualifications,
      upgradeOpportunities,
      missingOperations: [], // Would need access to operations repository to determine this
    };
  }

  /**
   * Helper: Get next certification level
   */
  private getNextLevel(currentLevel: CertificationLevel): CertificationLevel {
    switch (currentLevel) {
      case CertificationLevel.TRAINEE:
        return CertificationLevel.JUNIOR;
      case CertificationLevel.JUNIOR:
        return CertificationLevel.INTERMEDIATE;
      case CertificationLevel.INTERMEDIATE:
        return CertificationLevel.SENIOR;
      case CertificationLevel.SENIOR:
        return CertificationLevel.MASTER;
      case CertificationLevel.MASTER:
        return CertificationLevel.MASTER;
    }
  }
}

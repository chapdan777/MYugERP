import { Injectable, Inject } from '@nestjs/common';
import { CertificationLevel } from '../entities/worker-qualification.entity';
import { WorkerQualificationService } from './worker-qualification.service';
import { IWorkOrderRepository, WORK_ORDER_REPOSITORY } from '../../../work-orders/domain/repositories/work-order.repository.interface';

/**
 * Worker Assignment Validation Service
 * 
 * Validates that workers have appropriate qualifications before assignment to work orders
 */
@Injectable()
export class WorkerAssignmentValidationService {
  constructor(
    private readonly qualificationService: WorkerQualificationService,
    @Inject(WORK_ORDER_REPOSITORY)
    private readonly workOrderRepository: IWorkOrderRepository,
  ) {}

  /**
   * Validate if worker can be assigned to a work order
   */
  async validateWorkerAssignment(
    workerId: number,
    workOrderId: number,
    options?: {
      minimumLevel?: CertificationLevel;
      strictValidation?: boolean; // If true, throw error; if false, return warnings
    },
  ): Promise<ValidationResult> {
    const workOrder = await this.workOrderRepository.findById(workOrderId);
    if (!workOrder) {
      throw new Error(`Work order with ID ${workOrderId} not found`);
    }

    const operationId = workOrder.getOperationId();
    const operationName = workOrder.getOperationName();

    // Check if worker has qualification for this operation
    const qualification = await this.qualificationService.getValidQualification(
      workerId,
      operationId,
    );

    const result: ValidationResult = {
      isValid: false,
      workerId,
      workOrderId,
      operationId,
      operationName,
      errors: [],
      warnings: [],
      qualification: qualification ?? undefined,
    };

    // No qualification found
    if (!qualification) {
      result.errors.push({
        code: 'NO_QUALIFICATION',
        message: `Worker ${workerId} has no qualification for operation "${operationName}"`,
        severity: 'ERROR',
      });

      if (options?.strictValidation !== false) {
        return result;
      }
    }

    // Has qualification but it's not valid
    if (qualification && !qualification.isValid()) {
      if (!qualification.isActiveQualification()) {
        result.errors.push({
          code: 'QUALIFICATION_INACTIVE',
          message: `Worker's qualification for operation "${operationName}" is inactive`,
          severity: 'ERROR',
        });
      }

      const expiresAt = qualification.getExpiresAt();
      if (expiresAt && expiresAt < new Date()) {
        result.errors.push({
          code: 'QUALIFICATION_EXPIRED',
          message: `Worker's qualification for operation "${operationName}" expired on ${expiresAt.toISOString().split('T')[0]}`,
          severity: 'ERROR',
        });
      }

      if (options?.strictValidation !== false) {
        return result;
      }
    }

    // Check minimum certification level
    if (qualification && options?.minimumLevel) {
      const meetsLevel = await this.qualificationService.isWorkerQualified(
        workerId,
        operationId,
        options.minimumLevel,
      );

      if (!meetsLevel) {
        result.warnings.push({
          code: 'BELOW_MINIMUM_LEVEL',
          message: `Worker's certification level (${qualification.getCertificationLevel()}) is below required minimum (${options.minimumLevel})`,
          severity: 'WARNING',
        });
      }
    }

    // Check if qualification is expiring soon
    if (qualification && qualification.isExpiringSoon(30)) {
      const expiresAt = qualification.getExpiresAt();
      result.warnings.push({
        code: 'QUALIFICATION_EXPIRING_SOON',
        message: `Worker's qualification will expire on ${expiresAt?.toISOString().split('T')[0]}. Consider renewal.`,
        severity: 'WARNING',
      });
    }

    // Check if worker is trainee level (may require supervision)
    if (qualification && qualification.getCertificationLevel() === CertificationLevel.TRAINEE) {
      result.warnings.push({
        code: 'TRAINEE_LEVEL',
        message: `Worker has TRAINEE level certification. Supervision may be required.`,
        severity: 'WARNING',
      });
    }

    // Validation passed if no errors
    result.isValid = result.errors.length === 0;

    return result;
  }

  /**
   * Validate multiple workers for assignment to a work order
   */
  async validateTeamAssignment(
    workerIds: number[],
    workOrderId: number,
    options?: {
      minimumLevel?: CertificationLevel;
      requireLeadWorker?: boolean;
      strictValidation?: boolean;
    },
  ): Promise<TeamValidationResult> {
    const individualResults: ValidationResult[] = [];
    const teamErrors: ValidationIssue[] = [];
    const teamWarnings: ValidationIssue[] = [];

    // Validate each worker individually
    for (const workerId of workerIds) {
      const result = await this.validateWorkerAssignment(workerId, workOrderId, {
        minimumLevel: options?.minimumLevel,
        strictValidation: false, // Collect all issues, don't throw early
      });
      individualResults.push(result);
    }

    // Check team-level requirements
    const qualifiedWorkers = individualResults.filter(r => r.isValid);
    const unqualifiedWorkers = individualResults.filter(r => !r.isValid);

    if (unqualifiedWorkers.length > 0) {
      teamErrors.push({
        code: 'UNQUALIFIED_WORKERS',
        message: `${unqualifiedWorkers.length} worker(s) do not meet qualification requirements`,
        severity: 'ERROR',
      });
    }

    // Check if at least one senior/experienced worker is present
    if (options?.requireLeadWorker) {
      const hasLeadWorker = individualResults.some(
        r =>
          r.qualification &&
          (r.qualification.getCertificationLevel() === CertificationLevel.SENIOR ||
            r.qualification.getCertificationLevel() === CertificationLevel.MASTER),
      );

      if (!hasLeadWorker) {
        teamWarnings.push({
          code: 'NO_LEAD_WORKER',
          message: 'No SENIOR or MASTER level worker assigned. Consider adding an experienced lead.',
          severity: 'WARNING',
        });
      }
    }

    // Check for trainee workers requiring supervision
    const traineeCount = individualResults.filter(
      r => r.qualification?.getCertificationLevel() === CertificationLevel.TRAINEE,
    ).length;

    if (traineeCount > 0) {
      const supervisorCount = individualResults.filter(
        r =>
          r.qualification &&
          (r.qualification.getCertificationLevel() === CertificationLevel.SENIOR ||
            r.qualification.getCertificationLevel() === CertificationLevel.MASTER),
      ).length;

      if (supervisorCount === 0) {
        teamWarnings.push({
          code: 'TRAINEES_WITHOUT_SUPERVISION',
          message: `${traineeCount} trainee(s) assigned without senior supervisor`,
          severity: 'WARNING',
        });
      }
    }

    const isValid = teamErrors.length === 0 && (options?.strictValidation !== true || teamWarnings.length === 0);

    return {
      isValid,
      workOrderId,
      workerIds,
      qualifiedWorkers: qualifiedWorkers.length,
      unqualifiedWorkers: unqualifiedWorkers.length,
      individualResults,
      teamErrors,
      teamWarnings,
    };
  }

  /**
   * Get recommended workers for a work order
   */
  async getRecommendedWorkers(
    workOrderId: number,
    options?: {
      minimumLevel?: CertificationLevel;
      maxWorkers?: number;
    },
  ): Promise<{
    workOrderId: number;
    operationId: number;
    operationName: string;
    recommendedWorkerIds: number[];
    reason: string;
  }> {
    const workOrder = await this.workOrderRepository.findById(workOrderId);
    if (!workOrder) {
      throw new Error(`Work order with ID ${workOrderId} not found`);
    }

    const operationId = workOrder.getOperationId();
    const operationName = workOrder.getOperationName();

    // Get all qualified workers for this operation
    const qualifiedWorkers = await this.qualificationService.getQualifiedWorkers(
      operationId,
      options?.minimumLevel,
    );

    // Sort by certification level (highest first) and then by certification date (most recent first)
    qualifiedWorkers.sort((a, b) => {
      const levelA = this.getLevelValue(a.getCertificationLevel());
      const levelB = this.getLevelValue(b.getCertificationLevel());
      
      if (levelA !== levelB) {
        return levelB - levelA;
      }
      
      return b.getCertifiedAt().getTime() - a.getCertifiedAt().getTime();
    });

    const maxWorkers = options?.maxWorkers ?? qualifiedWorkers.length;
    const recommendedWorkerIds = qualifiedWorkers
      .slice(0, maxWorkers)
      .map(q => q.getWorkerId());

    return {
      workOrderId,
      operationId,
      operationName,
      recommendedWorkerIds,
      reason: `Selected ${recommendedWorkerIds.length} most qualified worker(s) based on certification level and experience`,
    };
  }

  /**
   * Helper: Get numeric value for certification level
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
 * Validation Result interface
 */
export interface ValidationResult {
  isValid: boolean;
  workerId: number;
  workOrderId: number;
  operationId: number;
  operationName: string;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  qualification?: {
    getId(): number | null;
    getCertificationLevel(): CertificationLevel;
    getExpiresAt(): Date | null;
    isValid(): boolean;
  };
}

/**
 * Team Validation Result interface
 */
export interface TeamValidationResult {
  isValid: boolean;
  workOrderId: number;
  workerIds: number[];
  qualifiedWorkers: number;
  unqualifiedWorkers: number;
  individualResults: ValidationResult[];
  teamErrors: ValidationIssue[];
  teamWarnings: ValidationIssue[];
}

/**
 * Validation Issue interface
 */
export interface ValidationIssue {
  code: string;
  message: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
}

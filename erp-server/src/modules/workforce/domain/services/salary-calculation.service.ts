import { Injectable, Inject } from '@nestjs/common';
import { SalaryProfile, SalaryType } from '../entities/salary-profile.entity';
import {
  ISalaryProfileRepository,
  SALARY_PROFILE_REPOSITORY,
} from '../repositories/salary-profile.repository.interface';
import {
  IWorkerAssignmentRepository,
  WORKER_ASSIGNMENT_REPOSITORY,
} from '../repositories/worker-assignment.repository.interface';
import { IWorkOrderRepository, WORK_ORDER_REPOSITORY } from '../../../work-orders/domain/repositories/work-order.repository.interface';

/**
 * Salary Calculation Service
 * 
 * Implements salary calculation engines for all three types:
 * - Piece-rate (сдельная): sum of piece rates from completed work
 * - Hourly (повременная): sum of actual hours × hourly rate
 * - Fixed (оклад): fixed monthly salary (pro-rated if partial month)
 * 
 * Business rule: Only one active profile per worker at a time
 */
@Injectable()
export class SalaryCalculationService {
  constructor(
    @Inject(SALARY_PROFILE_REPOSITORY)
    private readonly profileRepository: ISalaryProfileRepository,
    @Inject(WORKER_ASSIGNMENT_REPOSITORY)
    private readonly assignmentRepository: IWorkerAssignmentRepository,
    @Inject(WORK_ORDER_REPOSITORY)
    private readonly workOrderRepository: IWorkOrderRepository,
  ) {}

  /**
   * Create a new salary profile
   * Business rule: Deactivate existing active profile before creating new one
   */
  async createSalaryProfile(input: {
    workerId: number;
    workerName: string;
    salaryType: SalaryType;
    hourlyRate?: number;
    fixedMonthlySalary?: number;
    pieceRateMultiplier?: number;
    effectiveFrom: Date;
    effectiveTo?: Date | null;
    notes?: string;
    createdBy: number;
  }): Promise<SalaryProfile> {
    // Business rule: Only one active profile per worker
    const existingActive = await this.profileRepository.findActiveByWorkerId(input.workerId);
    if (existingActive) {
      existingActive.deactivate();
      await this.profileRepository.save(existingActive);
    }

    const profile = SalaryProfile.create(input);
    return await this.profileRepository.save(profile);
  }

  /**
   * Calculate salary for piece-rate worker (сдельщик)
   * Formula: sum(pieceRate) × multiplier
   */
  async calculatePieceRateSalary(input: {
    workerId: number;
    periodStart: Date;
    periodEnd: Date;
  }): Promise<SalaryCalculationResult> {
    const profile = await this.getEffectiveProfile(input.workerId, input.periodStart);
    
    if (profile.getSalaryType() !== SalaryType.PIECE_RATE) {
      throw new Error(`Worker ${input.workerId} does not have piece-rate salary type`);
    }

    // Get all assignments for the worker in the period
    const assignments = await this.assignmentRepository.findByWorkerId(input.workerId);
    const periodAssignments = assignments.filter(a => {
      const assignedAt = a.getAssignedAt();
      return assignedAt >= input.periodStart && assignedAt <= input.periodEnd;
    });

    let totalPieceRate = 0;
    const workOrderDetails: WorkOrderSalaryDetail[] = [];

    // Calculate total piece rate from completed work orders
    for (const assignment of periodAssignments) {
      const workOrder = await this.workOrderRepository.findById(assignment.getWorkOrderId());
      if (!workOrder) continue;

      // Only count completed work
      if (workOrder.isCompleted()) {
        const pieceRatePayment = workOrder.getTotalPieceRatePayment();
        totalPieceRate += pieceRatePayment;

        workOrderDetails.push({
          workOrderNumber: workOrder.getWorkOrderNumber(),
          pieceRatePayment,
          hoursWorked: assignment.getHoursWorked(),
          completedAt: workOrder.getCompletedAt(),
        });
      }
    }

    const multiplier = profile.getPieceRateMultiplier();
    const totalSalary = totalPieceRate * multiplier;

    return {
      workerId: input.workerId,
      workerName: profile.getWorkerName(),
      salaryType: SalaryType.PIECE_RATE,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      totalSalary,
      details: {
        pieceRateTotal: totalPieceRate,
        multiplier,
        workOrderCount: workOrderDetails.length,
        workOrders: workOrderDetails,
      },
      profile: {
        id: profile.getId()!,
        salaryType: profile.getSalaryType(),
        summary: profile.getSummary(),
      },
    };
  }

  /**
   * Calculate salary for hourly worker (повременщик)
   * Formula: sum(actualHours) × hourlyRate
   */
  async calculateHourlySalary(input: {
    workerId: number;
    periodStart: Date;
    periodEnd: Date;
  }): Promise<SalaryCalculationResult> {
    const profile = await this.getEffectiveProfile(input.workerId, input.periodStart);
    
    if (profile.getSalaryType() !== SalaryType.HOURLY) {
      throw new Error(`Worker ${input.workerId} does not have hourly salary type`);
    }

    const hourlyRate = profile.getHourlyRate();
    if (!hourlyRate) {
      throw new Error('Hourly rate is not set');
    }

    // Get all assignments for the worker in the period
    const assignments = await this.assignmentRepository.findByWorkerId(input.workerId);
    const periodAssignments = assignments.filter(a => {
      const assignedAt = a.getAssignedAt();
      return assignedAt >= input.periodStart && assignedAt <= input.periodEnd;
    });

    let totalHours = 0;
    const workOrderDetails: WorkOrderSalaryDetail[] = [];

    for (const assignment of periodAssignments) {
      const hoursWorked = assignment.getHoursWorked();
      totalHours += hoursWorked;

      const workOrder = await this.workOrderRepository.findById(assignment.getWorkOrderId());
      
      workOrderDetails.push({
        workOrderNumber: workOrder?.getWorkOrderNumber() ?? 'N/A',
        hoursWorked,
        hourlyRate,
        payment: hoursWorked * hourlyRate,
      });
    }

    const totalSalary = totalHours * hourlyRate;

    return {
      workerId: input.workerId,
      workerName: profile.getWorkerName(),
      salaryType: SalaryType.HOURLY,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      totalSalary,
      details: {
        totalHours,
        hourlyRate,
        workOrderCount: workOrderDetails.length,
        workOrders: workOrderDetails,
      },
      profile: {
        id: profile.getId()!,
        salaryType: profile.getSalaryType(),
        summary: profile.getSummary(),
      },
    };
  }

  /**
   * Calculate salary for salaried worker (оклад)
   * Formula: fixedMonthlySalary (pro-rated if partial month)
   */
  async calculateFixedSalary(input: {
    workerId: number;
    periodStart: Date;
    periodEnd: Date;
    workedDays?: number; // Optional: for pro-rating
  }): Promise<SalaryCalculationResult> {
    const profile = await this.getEffectiveProfile(input.workerId, input.periodStart);
    
    if (profile.getSalaryType() !== SalaryType.FIXED) {
      throw new Error(`Worker ${input.workerId} does not have fixed salary type`);
    }

    const fixedSalary = profile.getFixedMonthlySalary();
    if (!fixedSalary) {
      throw new Error('Fixed monthly salary is not set');
    }

    // Calculate days in the period
    const daysInPeriod = Math.ceil(
      (input.periodEnd.getTime() - input.periodStart.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Get days in month for pro-rating
    const periodMonth = input.periodStart.getMonth();
    const periodYear = input.periodStart.getFullYear();
    const daysInMonth = new Date(periodYear, periodMonth + 1, 0).getDate();

    let totalSalary: number;
    let isProRated = false;

    // If period is full month or worked days not specified, use full salary
    if (daysInPeriod >= daysInMonth || input.workedDays === undefined) {
      totalSalary = fixedSalary;
    } else {
      // Pro-rate based on worked days
      const workedDays = input.workedDays ?? daysInPeriod;
      totalSalary = (fixedSalary / daysInMonth) * workedDays;
      isProRated = true;
    }

    return {
      workerId: input.workerId,
      workerName: profile.getWorkerName(),
      salaryType: SalaryType.FIXED,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      totalSalary,
      details: {
        fixedMonthlySalary: fixedSalary,
        daysInMonth,
        daysInPeriod,
        workedDays: input.workedDays,
        isProRated,
      },
      profile: {
        id: profile.getId()!,
        salaryType: profile.getSalaryType(),
        summary: profile.getSummary(),
      },
    };
  }

  /**
   * Calculate salary for any worker (auto-detects salary type)
   */
  async calculateSalary(input: {
    workerId: number;
    periodStart: Date;
    periodEnd: Date;
    workedDays?: number;
  }): Promise<SalaryCalculationResult> {
    const profile = await this.getEffectiveProfile(input.workerId, input.periodStart);

    switch (profile.getSalaryType()) {
      case SalaryType.PIECE_RATE:
        return await this.calculatePieceRateSalary(input);
      
      case SalaryType.HOURLY:
        return await this.calculateHourlySalary(input);
      
      case SalaryType.FIXED:
        return await this.calculateFixedSalary(input);
      
      default:
        throw new Error(`Unknown salary type: ${profile.getSalaryType()}`);
    }
  }

  /**
   * Batch calculate salaries for multiple workers
   */
  async batchCalculateSalaries(input: {
    workerIds: number[];
    periodStart: Date;
    periodEnd: Date;
    workedDaysMap?: Map<number, number>; // workerId -> workedDays
  }): Promise<BatchSalaryCalculationResult> {
    const results: SalaryCalculationResult[] = [];
    const errors: { workerId: number; error: string }[] = [];

    for (const workerId of input.workerIds) {
      try {
        const workedDays = input.workedDaysMap?.get(workerId);
        const result = await this.calculateSalary({
          workerId,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          workedDays,
        });
        results.push(result);
      } catch (error) {
        errors.push({
          workerId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const totalSalary = results.reduce((sum, r) => sum + r.totalSalary, 0);

    return {
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      totalWorkers: input.workerIds.length,
      successfulCalculations: results.length,
      failedCalculations: errors.length,
      totalSalary,
      results,
      errors,
    };
  }

  /**
   * Get salary calculation report by salary type
   */
  async getSalaryReportBySalaryType(input: {
    periodStart: Date;
    periodEnd: Date;
  }): Promise<{
    periodStart: Date;
    periodEnd: Date;
    byType: Record<SalaryType, {
      workerCount: number;
      totalSalary: number;
      workers: { workerId: number; workerName: string; salary: number }[];
    }>;
    grandTotal: number;
  }> {
    const allProfiles = await this.profileRepository.findAllActive();

    const byType: Record<SalaryType, {
      workerCount: number;
      totalSalary: number;
      workers: { workerId: number; workerName: string; salary: number }[];
    }> = {
      [SalaryType.PIECE_RATE]: { workerCount: 0, totalSalary: 0, workers: [] },
      [SalaryType.HOURLY]: { workerCount: 0, totalSalary: 0, workers: [] },
      [SalaryType.FIXED]: { workerCount: 0, totalSalary: 0, workers: [] },
    };

    for (const profile of allProfiles) {
      try {
        const result = await this.calculateSalary({
          workerId: profile.getWorkerId(),
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
        });

        const type = profile.getSalaryType();
        byType[type].workerCount++;
        byType[type].totalSalary += result.totalSalary;
        byType[type].workers.push({
          workerId: profile.getWorkerId(),
          workerName: profile.getWorkerName(),
          salary: result.totalSalary,
        });
      } catch (error) {
        // Skip workers with calculation errors
        continue;
      }
    }

    const grandTotal = Object.values(byType).reduce((sum, t) => sum + t.totalSalary, 0);

    return {
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      byType,
      grandTotal,
    };
  }

  /**
   * Helper: Get effective profile for a worker at a specific date
   */
  private async getEffectiveProfile(workerId: number, _date: Date): Promise<SalaryProfile> {
    const profile = await this.profileRepository.findCurrentlyEffectiveByWorkerId(workerId);
    
    if (!profile) {
      throw new Error(`No effective salary profile found for worker ${workerId}`);
    }

    if (!profile.isCurrentlyEffective()) {
      throw new Error(`Salary profile for worker ${workerId} is not currently effective`);
    }

    return profile;
  }

  /**
   * Get salary profile management operations
   */
  async getWorkerSalaryProfiles(workerId: number): Promise<SalaryProfile[]> {
    return await this.profileRepository.findByWorkerId(workerId);
  }

  async getActiveProfile(workerId: number): Promise<SalaryProfile | null> {
    return await this.profileRepository.findActiveByWorkerId(workerId);
  }

  async updateProfile(
    profileId: number,
    updates: {
      hourlyRate?: number;
      fixedMonthlySalary?: number;
      pieceRateMultiplier?: number;
      effectiveFrom?: Date;
      effectiveTo?: Date | null;
      notes?: string;
    }
  ): Promise<SalaryProfile> {
    const profile = await this.profileRepository.findById(profileId);
    if (!profile) {
      throw new Error(`Salary profile ${profileId} not found`);
    }

    if (updates.hourlyRate !== undefined) {
      profile.updateHourlyRate(updates.hourlyRate);
    }

    if (updates.fixedMonthlySalary !== undefined) {
      profile.updateFixedMonthlySalary(updates.fixedMonthlySalary);
    }

    if (updates.pieceRateMultiplier !== undefined) {
      profile.updatePieceRateMultiplier(updates.pieceRateMultiplier);
    }

    if (updates.effectiveFrom !== undefined || updates.effectiveTo !== undefined) {
      profile.updateEffectiveDates(
        updates.effectiveFrom ?? profile.getEffectiveFrom(),
        updates.effectiveTo !== undefined ? updates.effectiveTo : profile.getEffectiveTo()
      );
    }

    if (updates.notes !== undefined) {
      profile.updateNotes(updates.notes);
    }

    return await this.profileRepository.save(profile);
  }

  async terminateProfile(profileId: number): Promise<SalaryProfile> {
    const profile = await this.profileRepository.findById(profileId);
    if (!profile) {
      throw new Error(`Salary profile ${profileId} not found`);
    }

    profile.terminate();
    return await this.profileRepository.save(profile);
  }
}

/**
 * Salary Calculation Result interface
 */
export interface SalaryCalculationResult {
  workerId: number;
  workerName: string;
  salaryType: SalaryType;
  periodStart: Date;
  periodEnd: Date;
  totalSalary: number;
  details: {
    pieceRateTotal?: number;
    multiplier?: number;
    totalHours?: number;
    hourlyRate?: number;
    fixedMonthlySalary?: number;
    daysInMonth?: number;
    daysInPeriod?: number;
    workedDays?: number;
    isProRated?: boolean;
    workOrderCount?: number;
    workOrders?: WorkOrderSalaryDetail[];
  };
  profile: {
    id: number;
    salaryType: SalaryType;
    summary: string;
  };
}

/**
 * Work Order Salary Detail interface
 */
export interface WorkOrderSalaryDetail {
  workOrderNumber: string;
  pieceRatePayment?: number;
  hoursWorked?: number;
  hourlyRate?: number;
  payment?: number;
  completedAt?: Date | null;
}

/**
 * Batch Salary Calculation Result interface
 */
export interface BatchSalaryCalculationResult {
  periodStart: Date;
  periodEnd: Date;
  totalWorkers: number;
  successfulCalculations: number;
  failedCalculations: number;
  totalSalary: number;
  results: SalaryCalculationResult[];
  errors: { workerId: number; error: string }[];
}

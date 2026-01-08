import { Injectable, Inject } from '@nestjs/common';
import {
  WorkerAssignment,
  WorkerRole,
} from '../entities/worker-assignment.entity';
import {
  IWorkerAssignmentRepository,
  WORKER_ASSIGNMENT_REPOSITORY,
} from '../repositories/worker-assignment.repository.interface';
import { WorkerAssignmentValidationService } from './worker-assignment-validation.service';
import { CertificationLevel } from '../entities/worker-qualification.entity';
import { IWorkOrderRepository, WORK_ORDER_REPOSITORY } from '../../../work-orders/domain/repositories/work-order.repository.interface';

/**
 * Worker Assignment Service
 * 
 * Handles assignment of workers to work orders, including individual and team assignments
 */
@Injectable()
export class WorkerAssignmentService {
  constructor(
    @Inject(WORKER_ASSIGNMENT_REPOSITORY)
    private readonly assignmentRepository: IWorkerAssignmentRepository,
    @Inject(WORK_ORDER_REPOSITORY)
    private readonly workOrderRepository: IWorkOrderRepository,
    private readonly validationService: WorkerAssignmentValidationService,
  ) {}

  /**
   * Assign a worker to a work order
   */
  async assignWorker(input: {
    workOrderId: number;
    workerId: number;
    workerName: string;
    role: WorkerRole;
    assignedBy: number;
    notes?: string;
    skipValidation?: boolean;
    minimumLevel?: CertificationLevel;
  }): Promise<{
    assignment: WorkerAssignment;
    validationResult: any;
  }> {
    // Validate work order exists
    const workOrder = await this.workOrderRepository.findById(input.workOrderId);
    if (!workOrder) {
      throw new Error(`Work order with ID ${input.workOrderId} not found`);
    }

    // Check if worker is already assigned to this work order
    const existingAssignments = await this.assignmentRepository.findByWorkerIdAndWorkOrderId(
      input.workerId,
      input.workOrderId,
    );

    const activeAssignment = existingAssignments.find(a => a.isActiveAssignment());
    if (activeAssignment) {
      throw new Error(
        `Worker ${input.workerId} is already assigned to work order ${input.workOrderId}`,
      );
    }

    // Validate qualification if not skipped
    let validationResult = null;
    if (!input.skipValidation) {
      validationResult = await this.validationService.validateWorkerAssignment(
        input.workerId,
        input.workOrderId,
        {
          minimumLevel: input.minimumLevel,
          strictValidation: true,
        },
      );

      if (!validationResult.isValid) {
        const errors = validationResult.errors.map((e: any) => e.message).join('; ');
        throw new Error(`Worker qualification validation failed: ${errors}`);
      }
    }

    // Create assignment
    const assignment = WorkerAssignment.create({
      workOrderId: input.workOrderId,
      workOrderNumber: workOrder.getWorkOrderNumber(),
      workerId: input.workerId,
      workerName: input.workerName,
      role: input.role,
      assignedBy: input.assignedBy,
      notes: input.notes,
    });

    const saved = await this.assignmentRepository.save(assignment);

    return {
      assignment: saved,
      validationResult,
    };
  }

  /**
   * Assign multiple workers to a work order (team/brigade assignment)
   */
  async assignTeam(input: {
    workOrderId: number;
    workers: {
      workerId: number;
      workerName: string;
      role: WorkerRole;
    }[];
    assignedBy: number;
    notes?: string;
    skipValidation?: boolean;
    minimumLevel?: CertificationLevel;
    requireLeadWorker?: boolean;
  }): Promise<{
    assignments: WorkerAssignment[];
    validationResult: any;
  }> {
    // Validate work order exists
    const workOrder = await this.workOrderRepository.findById(input.workOrderId);
    if (!workOrder) {
      throw new Error(`Work order with ID ${input.workOrderId} not found`);
    }

    // Validate team if not skipped
    let validationResult = null;
    if (!input.skipValidation) {
      const workerIds = input.workers.map(w => w.workerId);
      validationResult = await this.validationService.validateTeamAssignment(
        workerIds,
        input.workOrderId,
        {
          minimumLevel: input.minimumLevel,
          requireLeadWorker: input.requireLeadWorker ?? true,
          strictValidation: false,
        },
      );

      if (!validationResult.isValid) {
        const errors = validationResult.teamErrors.map((e: any) => e.message).join('; ');
        throw new Error(`Team qualification validation failed: ${errors}`);
      }
    }

    // Check for duplicate assignments
    for (const worker of input.workers) {
      const existingAssignments = await this.assignmentRepository.findByWorkerIdAndWorkOrderId(
        worker.workerId,
        input.workOrderId,
      );

      const activeAssignment = existingAssignments.find(a => a.isActiveAssignment());
      if (activeAssignment) {
        throw new Error(
          `Worker ${worker.workerId} is already assigned to work order ${input.workOrderId}`,
        );
      }
    }

    // Create assignments
    const assignments: WorkerAssignment[] = [];
    for (const worker of input.workers) {
      const assignment = WorkerAssignment.create({
        workOrderId: input.workOrderId,
        workOrderNumber: workOrder.getWorkOrderNumber(),
        workerId: worker.workerId,
        workerName: worker.workerName,
        role: worker.role,
        assignedBy: input.assignedBy,
        notes: input.notes,
      });

      const saved = await this.assignmentRepository.save(assignment);
      assignments.push(saved);
    }

    return {
      assignments,
      validationResult,
    };
  }

  /**
   * Unassign a worker from a work order
   */
  async unassignWorker(
    assignmentId: number,
    unassignedBy: number,
    reason: string,
  ): Promise<WorkerAssignment> {
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new Error(`Assignment with ID ${assignmentId} not found`);
    }

    assignment.unassign(unassignedBy, reason);
    return await this.assignmentRepository.save(assignment);
  }

  /**
   * Unassign all workers from a work order
   */
  async unassignAllWorkers(
    workOrderId: number,
    unassignedBy: number,
    reason: string,
  ): Promise<WorkerAssignment[]> {
    const assignments = await this.assignmentRepository.findActiveByWorkOrderId(workOrderId);

    const updated: WorkerAssignment[] = [];
    for (const assignment of assignments) {
      assignment.unassign(unassignedBy, reason);
      const saved = await this.assignmentRepository.save(assignment);
      updated.push(saved);
    }

    return updated;
  }

  /**
   * Reassign a worker (reactivate assignment)
   */
  async reassignWorker(assignmentId: number): Promise<WorkerAssignment> {
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new Error(`Assignment with ID ${assignmentId} not found`);
    }

    assignment.reassign();
    return await this.assignmentRepository.save(assignment);
  }

  /**
   * Update worker role in assignment
   */
  async updateWorkerRole(
    assignmentId: number,
    newRole: WorkerRole,
  ): Promise<WorkerAssignment> {
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new Error(`Assignment with ID ${assignmentId} not found`);
    }

    assignment.updateRole(newRole);
    return await this.assignmentRepository.save(assignment);
  }

  /**
   * Record hours worked for an assignment
   */
  async recordHours(assignmentId: number, hours: number): Promise<WorkerAssignment> {
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new Error(`Assignment with ID ${assignmentId} not found`);
    }

    assignment.recordHours(hours);
    return await this.assignmentRepository.save(assignment);
  }

  /**
   * Update assignment notes
   */
  async updateAssignmentNotes(
    assignmentId: number,
    notes: string | null,
  ): Promise<WorkerAssignment> {
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new Error(`Assignment with ID ${assignmentId} not found`);
    }

    assignment.updateNotes(notes);
    return await this.assignmentRepository.save(assignment);
  }

  /**
   * Get all assignments for a work order
   */
  async getWorkOrderAssignments(workOrderId: number): Promise<WorkerAssignment[]> {
    return await this.assignmentRepository.findByWorkOrderId(workOrderId);
  }

  /**
   * Get active assignments for a work order
   */
  async getActiveWorkOrderAssignments(workOrderId: number): Promise<WorkerAssignment[]> {
    return await this.assignmentRepository.findActiveByWorkOrderId(workOrderId);
  }

  /**
   * Get all assignments for a worker
   */
  async getWorkerAssignments(workerId: number): Promise<WorkerAssignment[]> {
    return await this.assignmentRepository.findByWorkerId(workerId);
  }

  /**
   * Get active assignments for a worker
   */
  async getActiveWorkerAssignments(workerId: number): Promise<WorkerAssignment[]> {
    return await this.assignmentRepository.findActiveByWorkerId(workerId);
  }

  /**
   * Get assignment statistics for a work order
   */
  async getWorkOrderAssignmentStats(workOrderId: number): Promise<{
    totalAssignments: number;
    activeAssignments: number;
    totalWorkers: number;
    activeWorkers: number;
    totalHoursWorked: number;
    averageHoursPerWorker: number;
    byRole: Record<WorkerRole, number>;
    leadWorker: WorkerAssignment | null;
  }> {
    const assignments = await this.assignmentRepository.findByWorkOrderId(workOrderId);

    const activeAssignments = assignments.filter(a => a.isActiveAssignment());
    const totalHoursWorked = assignments.reduce((sum, a) => sum + a.getHoursWorked(), 0);

    const byRole = {
      [WorkerRole.LEAD]: 0,
      [WorkerRole.SUPERVISOR]: 0,
      [WorkerRole.OPERATOR]: 0,
      [WorkerRole.ASSISTANT]: 0,
      [WorkerRole.TRAINEE]: 0,
    };

    let leadWorker: WorkerAssignment | null = null;

    for (const assignment of assignments) {
      byRole[assignment.getRole()]++;

      if (assignment.getRole() === WorkerRole.LEAD && assignment.isActiveAssignment()) {
        leadWorker = assignment;
      }
    }

    return {
      totalAssignments: assignments.length,
      activeAssignments: activeAssignments.length,
      totalWorkers: new Set(assignments.map(a => a.getWorkerId())).size,
      activeWorkers: new Set(activeAssignments.map(a => a.getWorkerId())).size,
      totalHoursWorked,
      averageHoursPerWorker: assignments.length > 0 ? totalHoursWorked / assignments.length : 0,
      byRole,
      leadWorker,
    };
  }

  /**
   * Get assignment statistics for a worker
   */
  async getWorkerAssignmentStats(workerId: number): Promise<{
    totalAssignments: number;
    activeAssignments: number;
    completedAssignments: number;
    totalHoursWorked: number;
    averageHoursPerAssignment: number;
    byRole: Record<WorkerRole, number>;
  }> {
    const assignments = await this.assignmentRepository.findByWorkerId(workerId);

    const activeAssignments = assignments.filter(a => a.isActiveAssignment());
    const completedAssignments = assignments.filter(a => !a.isActiveAssignment() && a.getUnassignedAt());
    const totalHoursWorked = assignments.reduce((sum, a) => sum + a.getHoursWorked(), 0);

    const byRole = {
      [WorkerRole.LEAD]: 0,
      [WorkerRole.SUPERVISOR]: 0,
      [WorkerRole.OPERATOR]: 0,
      [WorkerRole.ASSISTANT]: 0,
      [WorkerRole.TRAINEE]: 0,
    };

    for (const assignment of assignments) {
      byRole[assignment.getRole()]++;
    }

    return {
      totalAssignments: assignments.length,
      activeAssignments: activeAssignments.length,
      completedAssignments: completedAssignments.length,
      totalHoursWorked,
      averageHoursPerAssignment: assignments.length > 0 ? totalHoursWorked / assignments.length : 0,
      byRole,
    };
  }

  /**
   * Find available workers for a work order
   */
  async findAvailableWorkers(workOrderId: number): Promise<{
    recommended: number[];
    qualified: number[];
    currentlyAssigned: number[];
  }> {
    // Get recommended workers based on qualifications
    const recommendations = await this.validationService.getRecommendedWorkers(workOrderId);

    // Get currently assigned workers
    const currentAssignments = await this.getActiveWorkOrderAssignments(workOrderId);
    const currentlyAssigned = currentAssignments.map(a => a.getWorkerId());

    // Get all qualified workers
    const workOrder = await this.workOrderRepository.findById(workOrderId);
    if (!workOrder) {
      throw new Error(`Work order with ID ${workOrderId} not found`);
    }

    // Filter out already assigned workers from recommendations
    const availableRecommended = recommendations.recommendedWorkerIds.filter(
      id => !currentlyAssigned.includes(id),
    );

    return {
      recommended: availableRecommended,
      qualified: recommendations.recommendedWorkerIds,
      currentlyAssigned,
    };
  }
}

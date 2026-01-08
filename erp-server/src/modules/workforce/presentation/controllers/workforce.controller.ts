import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { WorkerQualificationService } from '../../domain/services/worker-qualification.service';
import { WorkerAssignmentService } from '../../domain/services/worker-assignment.service';
import {
  CertifyWorkerDto,
  UpgradeQualificationDto,
  RenewQualificationDto,
  UpdateQualificationNotesDto,
  AssignWorkerDto,
  AssignTeamDto,
  UnassignWorkerDto,
  UpdateWorkerRoleDto,
  RecordHoursDto,
  UpdateAssignmentNotesDto,
  BulkRenewQualificationsDto,
} from '../dtos/workforce.dto';

/**
 * Workforce Controller
 * 
 * Provides REST API for worker qualifications and assignments
 */
@Controller('workforce')
export class WorkforceController {
  constructor(
    private readonly qualificationService: WorkerQualificationService,
    private readonly assignmentService: WorkerAssignmentService,
  ) {}

  // ==================== QUALIFICATION ENDPOINTS ====================

  /**
   * Certify a worker for an operation
   */
  @Post('qualifications')
  @HttpCode(HttpStatus.CREATED)
  async certifyWorker(@Body() dto: CertifyWorkerDto) {
    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;

    const qualification = await this.qualificationService.certifyWorker({
      workerId: dto.workerId,
      operationId: dto.operationId,
      operationName: dto.operationName,
      certificationLevel: dto.certificationLevel,
      certifiedBy: dto.certifiedBy,
      expiresAt,
      notes: dto.notes,
    });

    return {
      id: qualification.getId(),
      workerId: qualification.getWorkerId(),
      operationId: qualification.getOperationId(),
      operationName: qualification.getOperationName(),
      certificationLevel: qualification.getCertificationLevel(),
      certifiedAt: qualification.getCertifiedAt(),
      expiresAt: qualification.getExpiresAt(),
      isActive: qualification.isActiveQualification(),
      isValid: qualification.isValid(),
    };
  }

  /**
   * Get all qualifications for a worker
   */
  @Get('workers/:workerId/qualifications')
  async getWorkerQualifications(@Param('workerId', ParseIntPipe) workerId: number) {
    const qualifications = await this.qualificationService.getWorkerQualifications(workerId);

    return qualifications.map(q => ({
      id: q.getId(),
      workerId: q.getWorkerId(),
      operationId: q.getOperationId(),
      operationName: q.getOperationName(),
      certificationLevel: q.getCertificationLevel(),
      certifiedAt: q.getCertifiedAt(),
      expiresAt: q.getExpiresAt(),
      isActive: q.isActiveQualification(),
      isValid: q.isValid(),
      notes: q.getNotes(),
    }));
  }

  /**
   * Get active qualifications for a worker
   */
  @Get('workers/:workerId/qualifications/active')
  async getActiveWorkerQualifications(@Param('workerId', ParseIntPipe) workerId: number) {
    const qualifications = await this.qualificationService.getActiveWorkerQualifications(workerId);

    return qualifications.map(q => ({
      id: q.getId(),
      operationId: q.getOperationId(),
      operationName: q.getOperationName(),
      certificationLevel: q.getCertificationLevel(),
      certifiedAt: q.getCertifiedAt(),
      expiresAt: q.getExpiresAt(),
      isValid: q.isValid(),
    }));
  }

  /**
   * Get qualification statistics for a worker
   */
  @Get('workers/:workerId/qualifications/statistics')
  async getWorkerQualificationStats(@Param('workerId', ParseIntPipe) workerId: number) {
    return await this.qualificationService.getWorkerQualificationStats(workerId);
  }

  /**
   * Upgrade qualification level
   */
  @Post('qualifications/:id/upgrade')
  async upgradeQualification(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpgradeQualificationDto,
  ) {
    const qualification = await this.qualificationService.upgradeQualification(
      id,
      dto.newLevel,
      dto.upgradedBy,
    );

    return {
      id: qualification.getId(),
      certificationLevel: qualification.getCertificationLevel(),
      certifiedAt: qualification.getCertifiedAt(),
    };
  }

  /**
   * Renew qualification
   */
  @Post('qualifications/:id/renew')
  async renewQualification(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RenewQualificationDto,
  ) {
    const newExpiration = new Date(dto.newExpirationDate);
    const qualification = await this.qualificationService.renewQualification(
      id,
      newExpiration,
      dto.renewedBy,
    );

    return {
      id: qualification.getId(),
      expiresAt: qualification.getExpiresAt(),
      updatedAt: qualification.getUpdatedAt(),
    };
  }

  /**
   * Deactivate qualification
   */
  @Delete('qualifications/:id')
  async deactivateQualification(@Param('id', ParseIntPipe) id: number) {
    await this.qualificationService.deactivateQualification(id);
    return { message: 'Qualification deactivated successfully' };
  }

  /**
   * Reactivate qualification
   */
  @Post('qualifications/:id/reactivate')
  async reactivateQualification(@Param('id', ParseIntPipe) id: number) {
    await this.qualificationService.reactivateQualification(id);
    return { message: 'Qualification reactivated successfully' };
  }

  /**
   * Update qualification notes
   */
  @Put('qualifications/:id/notes')
  async updateQualificationNotes(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQualificationNotesDto,
  ) {
    await this.qualificationService.updateQualificationNotes(id, dto.notes ?? null);
    return { message: 'Notes updated successfully' };
  }

  /**
   * Get qualifications expiring soon
   */
  @Get('qualifications/expiring-soon')
  async getExpiringSoonQualifications(@Query('withinDays', ParseIntPipe) withinDays: number = 30) {
    const qualifications = await this.qualificationService.getExpiringSoonQualifications(withinDays);

    return qualifications.map(q => ({
      id: q.getId(),
      workerId: q.getWorkerId(),
      operationName: q.getOperationName(),
      certificationLevel: q.getCertificationLevel(),
      expiresAt: q.getExpiresAt(),
    }));
  }

  /**
   * Get expired qualifications
   */
  @Get('qualifications/expired')
  async getExpiredQualifications() {
    const qualifications = await this.qualificationService.getExpiredQualifications();

    return qualifications.map(q => ({
      id: q.getId(),
      workerId: q.getWorkerId(),
      operationName: q.getOperationName(),
      expiresAt: q.getExpiresAt(),
    }));
  }

  /**
   * Bulk renew qualifications
   */
  @Post('qualifications/bulk-renew')
  async bulkRenewQualifications(@Body() dto: BulkRenewQualificationsDto) {
    const newExpiration = new Date(dto.newExpirationDate);
    const renewed = await this.qualificationService.bulkRenewQualifications(
      dto.qualificationIds,
      newExpiration,
      dto.renewedBy,
    );

    return {
      renewedCount: renewed.length,
      qualifications: renewed.map(q => ({ id: q.getId(), expiresAt: q.getExpiresAt() })),
    };
  }

  // ==================== ASSIGNMENT ENDPOINTS ====================

  /**
   * Assign a worker to a work order
   */
  @Post('work-orders/:workOrderId/assignments')
  @HttpCode(HttpStatus.CREATED)
  async assignWorker(
    @Param('workOrderId', ParseIntPipe) workOrderId: number,
    @Body() dto: AssignWorkerDto,
  ) {
    const result = await this.assignmentService.assignWorker({
      workOrderId,
      workerId: dto.workerId,
      workerName: dto.workerName,
      role: dto.role,
      assignedBy: dto.assignedBy,
      notes: dto.notes,
      skipValidation: dto.skipValidation,
      minimumLevel: dto.minimumLevel,
    });

    const assignment = result.assignment;

    return {
      id: assignment.getId(),
      workOrderId: assignment.getWorkOrderId(),
      workOrderNumber: assignment.getWorkOrderNumber(),
      workerId: assignment.getWorkerId(),
      workerName: assignment.getWorkerName(),
      role: assignment.getRole(),
      assignedAt: assignment.getAssignedAt(),
      isActive: assignment.isActiveAssignment(),
      validationResult: result.validationResult,
    };
  }

  /**
   * Assign a team to a work order
   */
  @Post('work-orders/:workOrderId/team-assignments')
  @HttpCode(HttpStatus.CREATED)
  async assignTeam(
    @Param('workOrderId', ParseIntPipe) workOrderId: number,
    @Body() dto: AssignTeamDto,
  ) {
    const result = await this.assignmentService.assignTeam({
      workOrderId,
      workers: dto.workers,
      assignedBy: dto.assignedBy,
      notes: dto.notes,
      skipValidation: dto.skipValidation,
      minimumLevel: dto.minimumLevel,
      requireLeadWorker: dto.requireLeadWorker,
    });

    return {
      assignedCount: result.assignments.length,
      assignments: result.assignments.map(a => ({
        id: a.getId(),
        workerId: a.getWorkerId(),
        workerName: a.getWorkerName(),
        role: a.getRole(),
        assignedAt: a.getAssignedAt(),
      })),
      validationResult: result.validationResult,
    };
  }

  /**
   * Get all assignments for a work order
   */
  @Get('work-orders/:workOrderId/assignments')
  async getWorkOrderAssignments(@Param('workOrderId', ParseIntPipe) workOrderId: number) {
    const assignments = await this.assignmentService.getWorkOrderAssignments(workOrderId);

    return assignments.map(a => ({
      id: a.getId(),
      workerId: a.getWorkerId(),
      workerName: a.getWorkerName(),
      role: a.getRole(),
      assignedAt: a.getAssignedAt(),
      unassignedAt: a.getUnassignedAt(),
      hoursWorked: a.getHoursWorked(),
      isActive: a.isActiveAssignment(),
      notes: a.getNotes(),
    }));
  }

  /**
   * Get active assignments for a work order
   */
  @Get('work-orders/:workOrderId/assignments/active')
  async getActiveWorkOrderAssignments(@Param('workOrderId', ParseIntPipe) workOrderId: number) {
    const assignments = await this.assignmentService.getActiveWorkOrderAssignments(workOrderId);

    return assignments.map(a => ({
      id: a.getId(),
      workerId: a.getWorkerId(),
      workerName: a.getWorkerName(),
      role: a.getRole(),
      assignedAt: a.getAssignedAt(),
      hoursWorked: a.getHoursWorked(),
    }));
  }

  /**
   * Get all assignments for a worker
   */
  @Get('workers/:workerId/assignments')
  async getWorkerAssignments(@Param('workerId', ParseIntPipe) workerId: number) {
    const assignments = await this.assignmentService.getWorkerAssignments(workerId);

    return assignments.map(a => ({
      id: a.getId(),
      workOrderId: a.getWorkOrderId(),
      workOrderNumber: a.getWorkOrderNumber(),
      role: a.getRole(),
      assignedAt: a.getAssignedAt(),
      unassignedAt: a.getUnassignedAt(),
      hoursWorked: a.getHoursWorked(),
      isActive: a.isActiveAssignment(),
    }));
  }

  /**
   * Get active assignments for a worker
   */
  @Get('workers/:workerId/assignments/active')
  async getActiveWorkerAssignments(@Param('workerId', ParseIntPipe) workerId: number) {
    const assignments = await this.assignmentService.getActiveWorkerAssignments(workerId);

    return assignments.map(a => ({
      id: a.getId(),
      workOrderId: a.getWorkOrderId(),
      workOrderNumber: a.getWorkOrderNumber(),
      role: a.getRole(),
      assignedAt: a.getAssignedAt(),
      hoursWorked: a.getHoursWorked(),
    }));
  }

  /**
   * Unassign a worker
   */
  @Post('assignments/:id/unassign')
  async unassignWorker(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UnassignWorkerDto,
  ) {
    const assignment = await this.assignmentService.unassignWorker(
      id,
      dto.unassignedBy,
      dto.reason,
    );

    return {
      id: assignment.getId(),
      unassignedAt: assignment.getUnassignedAt(),
      unassignmentReason: assignment.getUnassignmentReason(),
    };
  }

  /**
   * Unassign all workers from a work order
   */
  @Post('work-orders/:workOrderId/unassign-all')
  async unassignAllWorkers(
    @Param('workOrderId', ParseIntPipe) workOrderId: number,
    @Body() dto: UnassignWorkerDto,
  ) {
    const assignments = await this.assignmentService.unassignAllWorkers(
      workOrderId,
      dto.unassignedBy,
      dto.reason,
    );

    return {
      unassignedCount: assignments.length,
      assignments: assignments.map(a => ({
        id: a.getId(),
        workerId: a.getWorkerId(),
        unassignedAt: a.getUnassignedAt(),
      })),
    };
  }

  /**
   * Reassign a worker
   */
  @Post('assignments/:id/reassign')
  async reassignWorker(@Param('id', ParseIntPipe) id: number) {
    const assignment = await this.assignmentService.reassignWorker(id);

    return {
      id: assignment.getId(),
      isActive: assignment.isActiveAssignment(),
    };
  }

  /**
   * Update worker role
   */
  @Put('assignments/:id/role')
  async updateWorkerRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWorkerRoleDto,
  ) {
    await this.assignmentService.updateWorkerRole(id, dto.newRole);
    return { message: 'Role updated successfully' };
  }

  /**
   * Record hours worked
   */
  @Post('assignments/:id/hours')
  async recordHours(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RecordHoursDto,
  ) {
    const assignment = await this.assignmentService.recordHours(id, dto.hours);

    return {
      id: assignment.getId(),
      hoursWorked: assignment.getHoursWorked(),
    };
  }

  /**
   * Update assignment notes
   */
  @Put('assignments/:id/notes')
  async updateAssignmentNotes(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAssignmentNotesDto,
  ) {
    await this.assignmentService.updateAssignmentNotes(id, dto.notes ?? null);
    return { message: 'Notes updated successfully' };
  }

  /**
   * Get assignment statistics for a work order
   */
  @Get('work-orders/:workOrderId/assignments/statistics')
  async getWorkOrderAssignmentStats(@Param('workOrderId', ParseIntPipe) workOrderId: number) {
    return await this.assignmentService.getWorkOrderAssignmentStats(workOrderId);
  }

  /**
   * Get assignment statistics for a worker
   */
  @Get('workers/:workerId/assignments/statistics')
  async getWorkerAssignmentStats(@Param('workerId', ParseIntPipe) workerId: number) {
    return await this.assignmentService.getWorkerAssignmentStats(workerId);
  }

  /**
   * Find available workers for a work order
   */
  @Get('work-orders/:workOrderId/available-workers')
  async findAvailableWorkers(@Param('workOrderId', ParseIntPipe) workOrderId: number) {
    return await this.assignmentService.findAvailableWorkers(workOrderId);
  }
}

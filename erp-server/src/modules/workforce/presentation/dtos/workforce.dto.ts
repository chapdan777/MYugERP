import { IsNumber, IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { CertificationLevel } from '../../domain/entities/worker-qualification.entity';
import { WorkerRole } from '../../domain/entities/worker-assignment.entity';

/**
 * Certify Worker DTO
 */
export class CertifyWorkerDto {
  @IsNumber()
  workerId!: number;

  @IsNumber()
  operationId!: number;

  @IsString()
  operationName!: string;

  @IsEnum(CertificationLevel)
  certificationLevel!: CertificationLevel;

  @IsNumber()
  certifiedBy!: number;

  @IsOptional()
  @IsString()
  expiresAt?: string; // ISO date string

  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * Upgrade Qualification DTO
 */
export class UpgradeQualificationDto {
  @IsEnum(CertificationLevel)
  newLevel!: CertificationLevel;

  @IsNumber()
  upgradedBy!: number;
}

/**
 * Renew Qualification DTO
 */
export class RenewQualificationDto {
  @IsString()
  newExpirationDate!: string; // ISO date string

  @IsNumber()
  renewedBy!: number;
}

/**
 * Update Qualification Notes DTO
 */
export class UpdateQualificationNotesDto {
  @IsOptional()
  @IsString()
  notes?: string | null;
}

/**
 * Assign Worker DTO
 */
export class AssignWorkerDto {
  @IsNumber()
  workerId!: number;

  @IsString()
  workerName!: string;

  @IsEnum(WorkerRole)
  role!: WorkerRole;

  @IsNumber()
  assignedBy!: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  skipValidation?: boolean;

  @IsOptional()
  @IsEnum(CertificationLevel)
  minimumLevel?: CertificationLevel;
}

/**
 * Worker Info for Team Assignment
 */
export class TeamWorkerDto {
  @IsNumber()
  workerId!: number;

  @IsString()
  workerName!: string;

  @IsEnum(WorkerRole)
  role!: WorkerRole;
}

/**
 * Assign Team DTO
 */
export class AssignTeamDto {
  @IsNumber()
  workOrderId!: number;

  workers!: TeamWorkerDto[];

  @IsNumber()
  assignedBy!: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  skipValidation?: boolean;

  @IsOptional()
  @IsEnum(CertificationLevel)
  minimumLevel?: CertificationLevel;

  @IsOptional()
  @IsBoolean()
  requireLeadWorker?: boolean;
}

/**
 * Unassign Worker DTO
 */
export class UnassignWorkerDto {
  @IsNumber()
  unassignedBy!: number;

  @IsString()
  reason!: string;
}

/**
 * Update Worker Role DTO
 */
export class UpdateWorkerRoleDto {
  @IsEnum(WorkerRole)
  newRole!: WorkerRole;
}

/**
 * Record Hours DTO
 */
export class RecordHoursDto {
  @IsNumber()
  hours!: number;
}

/**
 * Update Assignment Notes DTO
 */
export class UpdateAssignmentNotesDto {
  @IsOptional()
  @IsString()
  notes?: string | null;
}

/**
 * Bulk Renew Qualifications DTO
 */
export class BulkRenewQualificationsDto {
  qualificationIds!: number[];

  @IsString()
  newExpirationDate!: string; // ISO date string

  @IsNumber()
  renewedBy!: number;
}

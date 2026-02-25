import { IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';
import { DepartmentOperation } from '../../domain/entities/department-operation.entity';

/**
 * DTOs for Department Operation REST API
 */

export class CreateDepartmentOperationDto {
  @IsNumber()
  departmentId!: number;

  @IsNumber()
  operationId!: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  priority?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateDepartmentOperationDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  priority?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class DepartmentOperationResponseDto {
  id!: number;
  departmentId!: number;
  operationId!: number;
  operationName?: string;
  operationCode?: string;
  priority!: number;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(departmentOperation: DepartmentOperation): DepartmentOperationResponseDto {
    const dto = new DepartmentOperationResponseDto();
    dto.id = departmentOperation.getId()!;
    dto.departmentId = departmentOperation.getDepartmentId();
    dto.operationId = departmentOperation.getOperationId();

    // Get operation details from domain entity
    const operation = departmentOperation.getOperation();
    if (operation) {
      dto.operationName = operation.name;
      dto.operationCode = operation.code;
    }

    dto.priority = departmentOperation.getPriority();
    dto.isActive = departmentOperation.getIsActive();
    dto.createdAt = departmentOperation.getCreatedAt();
    dto.updatedAt = departmentOperation.getUpdatedAt();
    return dto;
  }
}

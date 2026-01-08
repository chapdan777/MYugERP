import { IsString, IsBoolean, IsOptional, IsNotEmpty, MaxLength, IsEnum, IsNumber } from 'class-validator';
import { ProductionDepartment, GroupingStrategy } from '../../domain/entities/production-department.entity';

/**
 * DTOs for Production Department REST API
 */

export class CreateProductionDepartmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsEnum(GroupingStrategy)
  @IsOptional()
  groupingStrategy?: GroupingStrategy;

  @IsNumber()
  @IsOptional()
  groupingPropertyId?: number | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateProductionDepartmentDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsEnum(GroupingStrategy)
  @IsOptional()
  groupingStrategy?: GroupingStrategy;

  @IsNumber()
  @IsOptional()
  groupingPropertyId?: number | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ProductionDepartmentResponseDto {
  id!: number;
  code!: string;
  name!: string;
  description!: string | null;
  groupingStrategy!: GroupingStrategy;
  groupingPropertyId!: number | null;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(department: ProductionDepartment): ProductionDepartmentResponseDto {
    const dto = new ProductionDepartmentResponseDto();
    dto.id = department.getId()!;
    dto.code = department.getCode();
    dto.name = department.getName();
    dto.description = department.getDescription();
    dto.groupingStrategy = department.getGroupingStrategy();
    dto.groupingPropertyId = department.getGroupingPropertyId();
    dto.isActive = department.getIsActive();
    dto.createdAt = department.getCreatedAt();
    dto.updatedAt = department.getUpdatedAt();
    return dto;
  }
}

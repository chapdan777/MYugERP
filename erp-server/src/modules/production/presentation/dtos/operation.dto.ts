import { IsString, IsBoolean, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';
import { Operation } from '../../domain/entities/operation.entity';

/**
 * DTOs for Operation REST API
 */

export class CreateOperationDto {
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

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateOperationDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class OperationResponseDto {
  id!: number;
  code!: string;
  name!: string;
  description!: string | null;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(operation: Operation): OperationResponseDto {
    const dto = new OperationResponseDto();
    dto.id = operation.getId()!;
    dto.code = operation.getCode();
    dto.name = operation.getName();
    dto.description = operation.getDescription();
    dto.isActive = operation.getIsActive();
    dto.createdAt = operation.getCreatedAt();
    dto.updatedAt = operation.getUpdatedAt();
    return dto;
  }
}

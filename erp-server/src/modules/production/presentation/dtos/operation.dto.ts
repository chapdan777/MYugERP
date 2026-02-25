import { IsString, IsBoolean, IsOptional, IsNotEmpty, MaxLength, IsEnum, IsNumber, Min } from 'class-validator';
import { Operation } from '../../domain/entities/operation.entity';
import { OperationCalculationType } from '../../domain/enums/operation-calculation-type.enum';

/**
 * DTO для создания производственной операции
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

  @IsEnum(OperationCalculationType)
  @IsOptional()
  calculationType?: OperationCalculationType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultTimePerUnit?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultRatePerUnit?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

/**
 * DTO для обновления производственной операции
 */
export class UpdateOperationDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsEnum(OperationCalculationType)
  @IsOptional()
  calculationType?: OperationCalculationType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultTimePerUnit?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultRatePerUnit?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

/**
 * DTO ответа с данными операции
 */
export class OperationResponseDto {
  id!: number;
  code!: string;
  name!: string;
  description!: string | null;
  calculationType!: OperationCalculationType;
  defaultTimePerUnit!: number;
  defaultRatePerUnit!: number;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  /**
   * Преобразовать доменную сущность в DTO ответа
   */
  static fromEntity(operation: Operation): OperationResponseDto {
    const dto = new OperationResponseDto();
    dto.id = operation.getId()!;
    dto.code = operation.getCode();
    dto.name = operation.getName();
    dto.description = operation.getDescription();
    dto.calculationType = operation.getCalculationType();
    dto.defaultTimePerUnit = operation.getDefaultTimePerUnit();
    dto.defaultRatePerUnit = operation.getDefaultRatePerUnit();
    dto.isActive = operation.getIsActive();
    dto.createdAt = operation.getCreatedAt();
    dto.updatedAt = operation.getUpdatedAt();
    return dto;
  }
}

import { IsString, IsBoolean, IsOptional, IsNotEmpty, MaxLength, IsNumber, Min, IsHexColor } from 'class-validator';
import { WorkOrderStatusEntity } from '../../domain/entities/work-order-status.entity';

/**
 * DTO для создания статуса заказ-наряда
 */
export class CreateWorkOrderStatusDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    code!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name!: string;

    @IsHexColor()
    @IsOptional()
    color?: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    sortOrder?: number;

    @IsBoolean()
    @IsOptional()
    isInitial?: boolean;

    @IsBoolean()
    @IsOptional()
    isFinal?: boolean;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

/**
 * DTO для обновления статуса заказ-наряда
 */
export class UpdateWorkOrderStatusDto {
    @IsString()
    @IsOptional()
    @MaxLength(100)
    name?: string;

    @IsHexColor()
    @IsOptional()
    color?: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    sortOrder?: number;

    @IsBoolean()
    @IsOptional()
    isInitial?: boolean;

    @IsBoolean()
    @IsOptional()
    isFinal?: boolean;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

/**
 * DTO ответа со статусом заказ-наряда
 */
export class WorkOrderStatusResponseDto {
    id!: number;
    code!: string;
    name!: string;
    color!: string;
    sortOrder!: number;
    isInitial!: boolean;
    isFinal!: boolean;
    isActive!: boolean;
    createdAt!: Date;
    updatedAt!: Date;

    static fromEntity(entity: WorkOrderStatusEntity): WorkOrderStatusResponseDto {
        const dto = new WorkOrderStatusResponseDto();
        dto.id = entity.getId()!;
        dto.code = entity.getCode();
        dto.name = entity.getName();
        dto.color = entity.getColor();
        dto.sortOrder = entity.getSortOrder();
        dto.isInitial = entity.getIsInitial();
        dto.isFinal = entity.getIsFinal();
        dto.isActive = entity.getIsActive();
        dto.createdAt = entity.getCreatedAt();
        dto.updatedAt = entity.getUpdatedAt();
        return dto;
    }
}

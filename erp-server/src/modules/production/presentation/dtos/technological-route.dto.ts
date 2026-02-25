import { IsNumber, IsString, IsArray, ValidateNested, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TechnologicalRoute } from '../../domain/entities/technological-route.entity';
import { RouteStep } from '../../domain/entities/route-step.entity';
import { OperationMaterial } from '../../domain/entities/operation-material.entity';

export class CreateOperationMaterialDto {
    @ApiProperty({ description: 'ID материала' })
    @IsNumber()
    materialId!: number;

    @ApiProperty({ description: 'Формула расхода', example: '(W * H) / 1000000' })
    @IsString()
    consumptionFormula!: string;

    @ApiPropertyOptional({ description: 'Единица измерения результата формулы' })
    @IsOptional()
    @IsString()
    unit?: string;
}

export class CreateRouteStepDto {
    @ApiProperty({ description: 'Порядковый номер шага' })
    @IsNumber()
    stepNumber!: number;

    @ApiProperty({ description: 'ID операции' })
    @IsNumber()
    operationId!: number;

    @ApiProperty({ description: 'Обязательность шага' })
    @IsBoolean()
    isRequired!: boolean;

    @ApiPropertyOptional({ type: [CreateOperationMaterialDto], description: 'Материалы для операции' })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOperationMaterialDto)
    materials?: CreateOperationMaterialDto[];
}

export class CreateTechnologicalRouteDto {
    @ApiProperty({ description: 'ID продукта' })
    @IsNumber()
    productId!: number;

    @ApiProperty({ description: 'Название маршрута' })
    @IsString()
    name!: string;

    @ApiPropertyOptional({ description: 'Описание маршрута' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ type: [CreateRouteStepDto], description: 'Шаги маршрута' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateRouteStepDto)
    steps!: CreateRouteStepDto[];
}

export class UpdateTechnologicalRouteDto {
    @ApiPropertyOptional({ description: 'Название маршрута' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ description: 'Описание маршрута' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ description: 'Активность маршрута' })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({ type: [CreateRouteStepDto], description: 'Шаги маршрута (полная замена)' })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateRouteStepDto)
    steps?: CreateRouteStepDto[];
}

export class OperationMaterialResponseDto {
    @ApiProperty()
    materialId!: number;

    @ApiProperty()
    consumptionFormula!: string;

    @ApiPropertyOptional()
    unit?: string;

    static fromEntity(entity: OperationMaterial): OperationMaterialResponseDto {
        const dto = new OperationMaterialResponseDto();
        dto.materialId = entity.getMaterialId();
        dto.consumptionFormula = entity.getConsumptionFormula();
        dto.unit = entity.getUnit();
        return dto;
    }
}

export class RouteStepResponseDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    stepNumber!: number;

    @ApiProperty()
    operationId!: number;

    @ApiProperty()
    isRequired!: boolean;

    @ApiProperty({ type: [OperationMaterialResponseDto] })
    materials!: OperationMaterialResponseDto[];

    static fromEntity(entity: RouteStep): RouteStepResponseDto {
        const dto = new RouteStepResponseDto();
        dto.id = entity.getId() || 0;
        dto.stepNumber = entity.getStepNumber();
        dto.operationId = entity.getOperationId();
        dto.isRequired = entity.getIsRequired();
        dto.materials = entity.getMaterials().map(m => OperationMaterialResponseDto.fromEntity(m));
        return dto;
    }
}

export class TechnologicalRouteResponseDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    productId!: number;

    @ApiProperty()
    name!: string;

    @ApiPropertyOptional()
    description?: string;

    @ApiProperty()
    isActive!: boolean;

    @ApiProperty({ type: [RouteStepResponseDto] })
    steps!: RouteStepResponseDto[];

    static fromEntity(entity: TechnologicalRoute): TechnologicalRouteResponseDto {
        const dto = new TechnologicalRouteResponseDto();
        dto.id = entity.getId() || 0;
        dto.productId = entity.getProductId();
        dto.name = entity.getName();
        dto.description = entity.getDescription() || undefined;
        dto.isActive = entity.getIsActive();
        dto.steps = entity.getSteps().map(s => RouteStepResponseDto.fromEntity(s));
        return dto;
    }
}

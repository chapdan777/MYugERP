import { IsNumber, IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO для создания схемы компонента продукта
 * @description Поддерживает рекурсивную вложенность через childProductId
 */
export class CreateProductComponentSchemaDto {
    @ApiProperty({ description: 'ID родительского продукта', example: 1 })
    @IsNumber()
    productId!: number;

    @ApiPropertyOptional({ description: 'ID дочерней номенклатуры (для вложенных изделий)', example: 5 })
    @IsNumber()
    @IsOptional()
    childProductId?: number | null;

    @ApiProperty({ description: 'Название компонента', example: 'Филенка' })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ description: 'Формула высоты (H) дочернего элемента', example: 'H - (W_PR2 + W_PR4) + GP * 2' })
    @IsString()
    @IsNotEmpty()
    lengthFormula!: string;

    @ApiProperty({ description: 'Формула ширины (W) дочернего элемента', example: 'W - (W_PR1 + W_PR3) + GP * 2' })
    @IsString()
    @IsNotEmpty()
    widthFormula!: string;

    @ApiProperty({ description: 'Формула количества', example: '1' })
    @IsString()
    @IsNotEmpty()
    quantityFormula!: string;

    @ApiPropertyOptional({ description: 'Формула глубины (D) дочернего элемента', example: 'D - 4' })
    @IsString()
    @IsOptional()
    depthFormula?: string | null;

    @ApiPropertyOptional({ description: 'Дополнительные переменные для контекста', example: { GP: '10', Zazor: '5' } })
    @IsObject()
    @IsOptional()
    extraVariables?: Record<string, string> | null;

    @ApiPropertyOptional({ description: 'Формула условия включения', example: "ПРИКЛЕЙКА_ДЕКОРА == 'true'" })
    @IsString()
    @IsOptional()
    conditionFormula?: string | null;

    @ApiPropertyOptional({ description: 'Порядок сортировки', example: 0 })
    @IsNumber()
    @IsOptional()
    sortOrder?: number;
}

/**
 * DTO для обновления элемента шапки свойств
 */
import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateHeaderItemDto {
    @ApiProperty({ description: 'Порядок сортировки', required: false })
    @IsNumber()
    @IsOptional()
    sortOrder?: number;
}

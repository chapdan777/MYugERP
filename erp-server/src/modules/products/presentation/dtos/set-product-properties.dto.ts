import { IsArray, IsNumber, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ProductPropertyItemDto {
  @ApiProperty({ description: 'ID свойства', example: 1 })
  @IsNumber()
  propertyId!: number;

  @ApiProperty({ description: 'Обязательно ли свойство', example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiProperty({ description: 'Порядок отображения', example: 0, required: false })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @ApiProperty({ description: 'Значение по умолчанию для продукта', example: '50', required: false })
  @IsOptional()
  defaultValue?: string | null;

  @ApiProperty({ description: 'Активно ли свойство для продукта', example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class SetProductPropertiesDto {
  @ApiProperty({
    description: 'Список свойств продукта',
    type: [ProductPropertyItemDto],
    example: [
      { propertyId: 1, isRequired: false, displayOrder: 0 },
      { propertyId: 2, isRequired: true, displayOrder: 1 }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductPropertyItemDto)
  properties!: ProductPropertyItemDto[];
}

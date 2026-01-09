import { IsNumber, IsPositive, Min, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PropertyValueDto {
  @ApiProperty({
    description: 'ID свойства',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  propertyId!: number;

  @ApiProperty({
    description: 'Значение свойства',
    example: 'белый',
  })
  @IsString()
  value!: string;
}

export class CalculatePriceRequestDto {
  @ApiProperty({
    description: 'Базовая цена продукта',
    example: 1500,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  basePrice!: number;

  @ApiProperty({
    description: 'Количество единиц',
    example: 10,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  quantity!: number;

  @ApiProperty({
    description: 'Единицы измерения (м², м, шт)',
    example: 2.4,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  unit!: number;

  @ApiProperty({
    description: 'Дополнительный коэффициент',
    example: 1.2,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  coefficient!: number;

  @ApiPropertyOptional({
    description: 'Значения свойств для определения применимых модификаторов',
    type: [PropertyValueDto],
    example: [
      { propertyId: 1, value: 'белый' },
      { propertyId: 2, value: 'глянцевый' },
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => PropertyValueDto)
  propertyValues?: PropertyValueDto[];
}

export class AppliedModifierDto {
  @ApiProperty({ description: 'Код модификатора', example: 'COLOR_WHITE' })
  modifierCode!: string;

  @ApiProperty({ description: 'Название модификатора', example: 'Белый цвет' })
  modifierName!: string;

  @ApiProperty({ 
    description: 'Тип модификатора', 
    example: 'percentage',
    enum: ['fixed_price', 'percentage', 'fixed_amount', 'per_unit', 'multiplier']
  })
  modifierType!: string;

  @ApiProperty({ description: 'Значение модификатора', example: 10 })
  value!: number;

  @ApiProperty({ description: 'Влияние на цену', example: 150 })
  priceImpact!: number;
}

export class PriceBreakdownDto {
  @ApiProperty({ description: 'Базовая цена', example: 1500 })
  basePrice!: number;

  @ApiProperty({ description: 'После применения модификаторов', example: 1650 })
  afterModifiers!: number;

  @ApiProperty({ description: 'После умножения на единицы измерения', example: 3960 })
  afterUnit!: number;

  @ApiProperty({ description: 'После применения коэффициента', example: 4752 })
  afterCoefficient!: number;

  @ApiProperty({ description: 'Итоговая цена с учетом количества', example: 47520 })
  afterQuantity!: number;
}

export class CalculatePriceResponseDto {
  @ApiProperty({ description: 'Исходная базовая цена', example: 1500 })
  basePrice!: number;

  @ApiProperty({ description: 'Итоговая цена после всех модификаторов', example: 1650 })
  finalPrice!: number;

  @ApiProperty({ description: 'Итоговая цена × количество', example: 16500 })
  totalPrice!: number;

  @ApiProperty({
    description: 'Список примененных модификаторов',
    type: [AppliedModifierDto],
  })
  appliedModifiers!: AppliedModifierDto[];

  @ApiProperty({ description: 'Детализация расчета', type: PriceBreakdownDto })
  breakdown!: PriceBreakdownDto;
}
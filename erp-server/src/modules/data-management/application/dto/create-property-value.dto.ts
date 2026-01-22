/**
 * @file DTO для создания значения свойства
 * @description Содержит поля для создания нового значения свойства
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO для создания значения свойства
 */
export class CreatePropertyValueDto {
  @ApiProperty({
    description: 'ID свойства, к которому привязывается значение',
    example: '1',
  })
  @IsString()
  @IsNotEmpty()
  readonly propertyId: string;

  @ApiProperty({
    description: 'ID сущности, которой принадлежит значение',
    example: 'product:123',
  })
  @IsString()
  @IsNotEmpty()
  readonly entityId: string;

  @ApiProperty({
    description: 'Значение свойства (строка)',
    example: 'красный',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly stringValue?: string;

  @ApiProperty({
    description: 'Значение свойства (число)',
    example: 25.5,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  readonly numberValue?: number;

  @ApiProperty({
    description: 'Значение свойства (булево)',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  readonly booleanValue?: boolean;

  @ApiProperty({
    description: 'Значение свойства (дата)',
    example: '2023-12-31T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  readonly dateValue?: Date;

  @ApiProperty({
    description: 'Дополнительные параметры значения',
    example: { color: '#FF0000', hex: true },
    required: false,
  })
  @IsOptional()
  readonly metadata?: Record<string, any>;

  constructor(
    propertyId: string,
    entityId: string,
    stringValue?: string,
    numberValue?: number,
    booleanValue?: boolean,
    dateValue?: Date,
    metadata?: Record<string, any>,
  ) {
    this.propertyId = propertyId;
    this.entityId = entityId;
    this.stringValue = stringValue;
    this.numberValue = numberValue;
    this.booleanValue = booleanValue;
    this.dateValue = dateValue;
    this.metadata = metadata;
  }
}
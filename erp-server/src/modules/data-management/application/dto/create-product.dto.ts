/**
 * @file DTO для создания продукта/номенклатуры
 * @description Содержит поля для создания новой единицы номенклатуры
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsNotEmpty } from 'class-validator';

/**
 * DTO для создания продукта
 */
export class CreateProductDto {
  @ApiProperty({
    description: 'Название продукта',
    example: 'Ноутбук Dell Inspiron',
  })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    description: 'Описание продукта',
    example: 'Ноутбук для офисной работы',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly description?: string;

  @ApiProperty({
    description: 'Артикул продукта',
    example: 'NB-DI-15-3580',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly sku?: string;

  @ApiProperty({
    description: 'Цена продукта',
    example: 59990,
  })
  @IsNumber()
  @IsNotEmpty()
  readonly price: number;

  @ApiProperty({
    description: 'Валюта цены',
    example: 'RUB',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly currency?: string;

  @ApiProperty({
    description: 'Единица измерения',
    example: 'шт',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly unitOfMeasure?: string;

  @ApiProperty({
    description: 'Категория продукта',
    example: 'Электроника > Ноутбуки',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly category?: string;

  @ApiProperty({
    description: 'Доступен ли продукт',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  readonly isActive?: boolean;

  @ApiProperty({
    description: 'Дополнительные свойства продукта',
    example: { color: 'черный', weight: 2.1 },
    required: false,
  })
  @IsOptional()
  readonly properties?: Record<string, any>;

  @ApiProperty({
    description: 'Теги продукта',
    example: ['ноутбук', 'офис', 'работа'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  readonly tags?: string[];

  constructor(
    name: string,
    price: number,
    description?: string,
    sku?: string,
    currency?: string,
    unitOfMeasure?: string,
    category?: string,
    isActive?: boolean,
    properties?: Record<string, any>,
    tags?: string[],
  ) {
    this.name = name;
    this.price = price;
    this.description = description;
    this.sku = sku;
    this.currency = currency;
    this.unitOfMeasure = unitOfMeasure;
    this.category = category;
    this.isActive = isActive;
    this.properties = properties;
    this.tags = tags;
  }
}
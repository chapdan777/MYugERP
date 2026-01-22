/**
 * @file DTO для создания дополнительного свойства
 * @description Содержит поля для создания нового дополнительного свойства
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray, IsEnum, IsNotEmpty } from 'class-validator';

/**
 * Типы значений свойства
 */
export enum PropertyValueType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  SELECT = 'select',
  MULTI_SELECT = 'multi-select',
}

/**
 * DTO для создания дополнительного свойства
 */
export class CreatePropertyDto {
  @ApiProperty({
    description: 'Название свойства',
    example: 'Цвет',
  })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    description: 'Код свойства',
    example: 'color',
  })
  @IsString()
  @IsNotEmpty()
  readonly code: string;

  @ApiProperty({
    description: 'Тип значения свойства',
    enum: PropertyValueType,
    example: PropertyValueType.SELECT,
  })
  @IsEnum(PropertyValueType)
  @IsNotEmpty()
  readonly valueType: PropertyValueType;

  @ApiProperty({
    description: 'Назначение свойства',
    example: 'product',
  })
  @IsString()
  @IsNotEmpty()
  readonly targetEntity: string;

  @ApiProperty({
    description: 'Обязательное ли поле',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  readonly isRequired?: boolean;

  @ApiProperty({
    description: 'Можно ли редактировать свойство',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  readonly isEditable?: boolean;

  @ApiProperty({
    description: 'Доступно ли свойство',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  readonly isActive?: boolean;

  @ApiProperty({
    description: 'Возможные значения для select/multi-select',
    example: ['красный', 'синий', 'зеленый'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  readonly allowedValues?: string[];

  @ApiProperty({
    description: 'Описание свойства',
    example: 'Цвет товара',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly description?: string;

  constructor(
    name: string,
    code: string,
    valueType: PropertyValueType,
    targetEntity: string,
    isRequired?: boolean,
    isEditable?: boolean,
    isActive?: boolean,
    allowedValues?: string[],
    description?: string,
  ) {
    this.name = name;
    this.code = code;
    this.valueType = valueType;
    this.targetEntity = targetEntity;
    this.isRequired = isRequired;
    this.isEditable = isEditable;
    this.isActive = isActive;
    this.allowedValues = allowedValues;
    this.description = description;
  }
}
/**
 * @file DTO для создания шапки заказа
 * @description Содержит поля для создания шаблона шапки заказа и настройки свойств
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray, IsObject, IsNotEmpty } from 'class-validator';

/**
 * DTO для создания шапки заказа
 */
export class CreateOrderHeaderDto {
  @ApiProperty({
    description: 'Название шаблона заказа',
    example: 'Стандартный заказ',
  })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    description: 'Код шаблона заказа',
    example: 'standard_order',
  })
  @IsString()
  @IsNotEmpty()
  readonly code: string;

  @ApiProperty({
    description: 'Описание шаблона заказа',
    example: 'Стандартный шаблон для новых заказов',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly description?: string;

  @ApiProperty({
    description: 'Доступен ли шаблон',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  readonly isActive?: boolean;

  @ApiProperty({
    description: 'Обязательные поля в шапке заказа',
    example: ['customer', 'delivery_date'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  readonly requiredFields?: string[];

  @ApiProperty({
    description: 'Настройки полей шапки заказа',
    example: {
      customer: { required: true, editable: true },
      delivery_date: { required: true, editable: true },
      discount: { required: false, editable: true }
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  readonly fieldSettings?: Record<string, { required: boolean; editable: boolean }>;

  @ApiProperty({
    description: 'Дополнительные свойства шаблона',
    example: { auto_approve: false, notification_enabled: true },
    required: false,
  })
  @IsObject()
  @IsOptional()
  readonly properties?: Record<string, any>;

  constructor(
    name: string,
    code: string,
    description?: string,
    isActive?: boolean,
    requiredFields?: string[],
    fieldSettings?: Record<string, { required: boolean; editable: boolean }>,
    properties?: Record<string, any>,
  ) {
    this.name = name;
    this.code = code;
    this.description = description;
    this.isActive = isActive;
    this.requiredFields = requiredFields;
    this.fieldSettings = fieldSettings;
    this.properties = properties;
  }
}
import { IsString, IsEnum, IsBoolean, IsNumber, IsOptional, IsArray, Min, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyDataType } from '../../domain/enums/property-data-type.enum';

export class CreatePropertyRequestDto {
  @ApiProperty({ description: 'Уникальный код свойства', example: 'width' })
  @IsString()
  code!: string;

  @ApiProperty({ description: 'Название свойства', example: 'Ширина' })
  @IsString()
  name!: string;

  @ApiProperty({ enum: PropertyDataType, description: 'Тип данных свойства' })
  @IsEnum(PropertyDataType)
  dataType!: PropertyDataType;

  @ApiPropertyOptional({ description: 'Возможные значения для SELECT/MULTI_SELECT', example: ['option1', 'option2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  possibleValues?: string[];

  @ApiPropertyOptional({ description: 'Значение по умолчанию', example: '100' })
  @IsOptional()
  @IsString()
  defaultValue?: string;

  @ApiProperty({ description: 'Обязательное ли свойство', default: false })
  @IsBoolean()
  isRequired!: boolean;

  @ApiProperty({ description: 'Порядок отображения', default: 0 })
  @IsNumber()
  @Min(0)
  displayOrder!: number;

  @ApiPropertyOptional({ description: 'Имя переменной для формул (латиница, цифры, _)', example: 'WIDTH' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9_]*$/, { message: 'Имя переменной может содержать только латинские буквы, цифры и подчеркивание' })
  variableName?: string;
}

export class UpdatePropertyRequestDto {
  @ApiPropertyOptional({ description: 'Название свойства' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Код свойства' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Возможные значения' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  possibleValues?: string[];

  @ApiPropertyOptional({ description: 'Значение по умолчанию' })
  @IsOptional()
  @IsString()
  defaultValue?: string;

  @ApiPropertyOptional({ description: 'Обязательное ли свойство' })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: 'Порядок отображения' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Имя переменной для формул' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9_]*$/, { message: 'Имя переменной может содержать только латинские буквы, цифры и подчеркивание' })
  variableName?: string;
}

export class PropertyResponseDto {
  @ApiProperty({ description: 'ID свойства' })
  id!: number;

  @ApiProperty({ description: 'Код свойства' })
  code!: string;

  @ApiProperty({ description: 'Название свойства' })
  name!: string;

  @ApiProperty({ enum: PropertyDataType, description: 'Тип данных' })
  dataType!: PropertyDataType;

  @ApiPropertyOptional({ description: 'Возможные значения' })
  possibleValues!: string[] | null;

  @ApiPropertyOptional({ description: 'Значение по умолчанию' })
  defaultValue!: string | null;

  @ApiProperty({ description: 'Обязательное ли свойство' })
  isRequired!: boolean;

  @ApiProperty({ description: 'Порядок отображения' })
  displayOrder!: number;

  @ApiProperty({ description: 'Активно ли свойство' })
  isActive!: boolean;

  @ApiPropertyOptional({ description: 'Имя переменной для формул' })
  variableName!: string | null;

  @ApiProperty({ description: 'Дата создания' })
  createdAt!: Date;

  @ApiProperty({ description: 'Дата обновления' })
  updatedAt!: Date;
}

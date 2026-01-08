import { IsString, IsEnum, IsBoolean, IsNumber, IsOptional, IsArray, Min } from 'class-validator';
import { PropertyDataType } from '../../domain/enums/property-data-type.enum';

export class CreatePropertyRequestDto {
  @IsString()
  code!: string;

  @IsString()
  name!: string;

  @IsEnum(PropertyDataType)
  dataType!: PropertyDataType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  possibleValues?: string[];

  @IsOptional()
  @IsString()
  defaultValue?: string;

  @IsBoolean()
  isRequired!: boolean;

  @IsNumber()
  @Min(0)
  displayOrder!: number;
}

export class UpdatePropertyRequestDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  possibleValues?: string[];

  @IsOptional()
  @IsString()
  defaultValue?: string;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;
}

export class PropertyResponseDto {
  id!: number;
  code!: string;
  name!: string;
  dataType!: PropertyDataType;
  possibleValues!: string[] | null;
  defaultValue!: string | null;
  isRequired!: boolean;
  displayOrder!: number;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

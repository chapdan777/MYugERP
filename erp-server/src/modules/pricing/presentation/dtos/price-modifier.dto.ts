import { IsString, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { ModifierType } from '../../domain/enums/modifier-type.enum';

export class CreatePriceModifierRequestDto {
  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsEnum(ModifierType)
  modifierType!: ModifierType;

  @IsNumber()
  value!: number;

  @IsOptional()
  @IsNumber()
  propertyId?: number;

  @IsOptional()
  @IsString()
  propertyValue?: string;

  @IsOptional()
  @IsString()
  conditionExpression?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priority?: number;
}

export class UpdatePriceModifierRequestDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsNumber()
  propertyId?: number | null;

  @IsOptional()
  @IsString()
  propertyValue?: string | null;

  @IsOptional()
  @IsString()
  conditionExpression?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priority?: number;
}

export class PriceModifierResponseDto {
  id!: number;
  name!: string;
  code!: string;
  modifierType!: ModifierType;
  value!: number;
  propertyId!: number | null;
  propertyValue!: string | null;
  conditionExpression!: string | null;
  priority!: number;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

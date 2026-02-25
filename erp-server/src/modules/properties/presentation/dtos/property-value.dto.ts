import { IsString, IsNumber, IsOptional, IsBoolean, Min, IsPositive } from 'class-validator';

export class PropertyValueResponseDto {
  id!: number;
  propertyId!: number;
  value!: string;
  priceModifierId!: number | null;
  priceModifier!: {
    id: number;
    name: string;
    value: number;
    type: string;
    code: string;
  } | null;
  displayOrder!: number;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

export class CreatePropertyValueRequestDto {
  @IsNumber()
  @IsPositive()
  propertyId!: number;

  @IsString()
  value!: string;

  @IsOptional()
  priceModifierId?: number | null;

  @IsString()
  @IsOptional()
  priceModifierValue?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  displayOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdatePropertyValueRequestDto {
  @IsString()
  @IsOptional()
  value?: string;

  @IsOptional()
  priceModifierId?: number | null;

  @IsString()
  @IsOptional()
  priceModifierValue?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  displayOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
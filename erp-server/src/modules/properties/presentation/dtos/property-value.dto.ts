import { IsString, IsNumber, IsOptional, IsBoolean, Min, IsPositive } from 'class-validator';

export class PropertyValueResponseDto {
  id!: number;
  propertyId!: number;
  value!: string;
  priceModifierId!: number | null;
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

  @IsNumber()
  @IsOptional()
  priceModifierId?: number | null;

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

  @IsNumber()
  @IsOptional()
  priceModifierId?: number | null;

  @IsNumber()
  @Min(0)
  @IsOptional()
  displayOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
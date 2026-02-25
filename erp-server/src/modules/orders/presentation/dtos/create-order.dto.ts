import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsNumber, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class CreateOrderItemDto {
  @IsNumber()
  productId!: number;

  @IsNumber()
  quantity!: number;

  @IsOptional()
  @IsNumber()
  length?: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  depth?: number;

  @IsString()
  unit!: string;

  @IsOptional()
  @IsNumber()
  basePrice?: number;

  @IsOptional()
  @IsNumber()
  finalPrice?: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsOptional()
  @IsArray()
  properties?: { propertyId: number; propertyName: string; propertyCode: string; value: string }[];
}

class CreateOrderSectionDto {
  @IsNumber()
  sectionNumber!: number;

  @IsString()
  @IsNotEmpty()
  sectionName!: string;

  @IsNumber()
  headerId!: number;

  @IsOptional()
  @IsArray()
  propertyValues?: { propertyId: number; propertyName: string; propertyCode: string; value: string }[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}

export class CreateOrderDto {
  @IsInt()
  clientId!: number;

  @IsString()
  @IsOptional()
  clientName?: string;

  @IsOptional()
  @Type(() => Date)
  deadline?: Date;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderSectionDto)
  sections!: CreateOrderSectionDto[];
}
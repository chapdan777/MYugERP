import { IsString, IsOptional, IsArray, ValidateNested, IsNumber, IsInt } from 'class-validator';
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
  @IsOptional()
  unit?: string;

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
  properties?: { propertyId: number; propertyName: string; propertyCode: string; value: string; variableName?: string }[];

  @IsOptional()
  nestedProperties?: Record<number, { propertyId: number; propertyName: string; propertyCode: string; value: string; variableName?: string }[]>;
}

class CreateOrderSectionDto {
  @IsOptional()
  @IsNumber()
  sectionNumber?: number;

  @IsString()
  @IsOptional()
  sectionName?: string;

  @IsOptional()
  @IsNumber()
  headerId?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  propertyValues?: { propertyId: number; propertyName: string; propertyCode: string; value: string; variableName?: string }[];


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
  documentType?: string;

  @IsString()
  @IsOptional()
  manager?: string;

  @IsString()
  @IsOptional()
  orderName?: string;

  @IsOptional()
  @Type(() => Date)
  launchDate?: Date;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderSectionDto)
  sections!: CreateOrderSectionDto[];
}
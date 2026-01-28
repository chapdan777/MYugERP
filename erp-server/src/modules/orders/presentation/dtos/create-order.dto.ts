import { IsString, IsNotEmpty, IsUUID, IsOptional, IsArray, ValidateNested, IsNumber, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class CreateOrderItemDto {
  @IsUUID()
  productId!: string;

  @IsNumber()
  quantity!: number;

  @IsOptional()
  @IsInt()
  length?: number;

  @IsOptional()
  @IsInt()
  width?: number;

  @IsString()
  unit!: string;

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

  @IsOptional()
  @IsArray()
  propertyValues?: { propertyId: number; propertyName: string; propertyCode: string; value: string }[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}

export class CreateOrderDto {
  @IsUUID()
  clientId!: number;

  @IsString()
  @IsNotEmpty()
  clientName!: string;

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
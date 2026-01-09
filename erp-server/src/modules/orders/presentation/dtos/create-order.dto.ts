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
}

class CreateOrderSectionDto {
  @IsString()
  @IsNotEmpty()
  sectionName!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  typeOrder!: string;

  @IsString()
  @IsNotEmpty()
  nameOrder!: string;

  @IsUUID()
  clientId!: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderSectionDto)
  sections!: CreateOrderSectionDto[];
}
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  basePrice!: number;

  @IsString()
  @IsNotEmpty()
  unit!: string;

  @IsNumber()
  @IsOptional()
  defaultLength?: number;

  @IsNumber()
  @IsOptional()
  defaultWidth?: number;

  @IsNumber()
  @IsOptional()
  defaultDepth?: number;
}
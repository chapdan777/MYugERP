import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, Min, MaxLength } from 'class-validator';
import { ProductCategory } from '../../domain/enums/product-category.enum';

/**
 * DTO для создания продукта
 */
export class CreateProductRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code!: string;

  @IsEnum(ProductCategory)
  category!: ProductCategory;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
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

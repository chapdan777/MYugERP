import { IsString, IsOptional, IsEnum, IsNumber, Min, MaxLength } from 'class-validator';
import { ProductCategory } from '../../domain/enums/product-category.enum';

/**
 * DTO для обновления продукта
 */
export class UpdateProductRequestDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  basePrice?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsEnum(ProductCategory)
  @IsOptional()
  category?: ProductCategory;

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

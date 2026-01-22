import { IsNumber, IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * DTO для добавления элемента в шапку
 */
export class AddItemToHeaderDto {
  @IsNumber()
  @IsNotEmpty()
  propertyId!: number;

  @IsString()
  @IsNotEmpty()
  value!: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}
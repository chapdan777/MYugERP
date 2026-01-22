/**
 * DTO для создания шапки свойств
 */
import { IsString, IsNotEmpty, IsNumber, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreatePropertyHeaderDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @IsNumber()
  @IsNotEmpty()
  orderTypeId!: number;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;
}
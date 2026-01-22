/**
 * DTO для обновления шапки свойств
 */
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdatePropertyHeaderDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;
}
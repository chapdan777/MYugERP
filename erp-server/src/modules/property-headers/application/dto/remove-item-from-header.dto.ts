import { IsNumber, IsNotEmpty } from 'class-validator';

/**
 * DTO для удаления элемента из шапки
 */
export class RemoveItemFromHeaderDto {
  @IsNumber()
  @IsNotEmpty()
  propertyId!: number;
}
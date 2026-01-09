import { IsString, IsNotEmpty, IsUUID, IsNumber } from 'class-validator';

export class CreatePriceModifierDto {
  @IsUUID()
  productId!: string;

  @IsUUID()
  propertyId!: string;

  @IsString()
  @IsNotEmpty()
  propertyValue!: string;

  @IsNumber()
  priceChange!: number;

  @IsString()
  @IsNotEmpty()
  changeType!: string;
}
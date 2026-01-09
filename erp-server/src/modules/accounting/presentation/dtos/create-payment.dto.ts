import { IsString, IsNotEmpty, IsUUID, IsNumber } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  clientId!: string;

  @IsNumber()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  paymentMethod!: string;
}
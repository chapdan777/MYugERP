import { IsString, IsNotEmpty } from 'class-validator';

export class CreateOrderTemplateDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  orderType!: string;
}
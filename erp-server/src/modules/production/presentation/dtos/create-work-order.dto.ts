import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateWorkOrderDto {
  @IsUUID()
  orderId!: string;

  @IsUUID()
  departmentId!: string;

  @IsString()
  @IsNotEmpty()
  workOrderNumber!: string;
}
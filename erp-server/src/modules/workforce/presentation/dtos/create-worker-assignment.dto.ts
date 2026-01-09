import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateWorkerAssignmentDto {
  @IsUUID()
  workOrderId!: string;

  @IsUUID()
  workerId!: string;

  @IsString()
  @IsNotEmpty()
  role!: string;
}
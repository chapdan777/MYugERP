import { IsNumber } from 'class-validator';
import { WorkOrderStatus } from '../../domain/enums/work-order-status.enum';
import { WorkOrderResponseDto } from './work-order.dto';

/**
 * DTOs for Kanban Board REST API
 */

export class KanbanColumnDto {
  status!: WorkOrderStatus;
  label!: string;
  workOrders!: WorkOrderResponseDto[];
  count!: number;
  totalEstimatedHours!: number;
  totalActualHours!: number;
}

export class KanbanBoardDto {
  departmentId!: number;
  departmentName!: string;
  columns!: KanbanColumnDto[];
  totalWorkOrders!: number;
  lastUpdated!: Date;
}

export class MoveWorkOrderDto {
  @IsNumber()
  workOrderId!: number;

  @IsNumber()
  targetStatus!: WorkOrderStatus;
}

import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { WorkOrder } from '../../domain/entities/work-order.entity';
import { WorkOrderItem } from '../../domain/entities/work-order-item.entity';
import { WorkOrderStatus } from '../../domain/enums/work-order-status.enum';

/**
 * DTOs for Work Order REST API
 */

export class GenerateWorkOrdersDto {
  @IsNumber()
  orderId!: number;
}

export class WorkOrderItemResponseDto {
  id!: number;
  orderItemId!: number;
  productId!: number;
  productName!: string;
  operationId!: number;
  operationName!: string;
  quantity!: number;
  unit!: string;
  estimatedHours!: number;
  pieceRate!: number;
  actualHours!: number | null;

  static fromEntity(item: WorkOrderItem): WorkOrderItemResponseDto {
    const dto = new WorkOrderItemResponseDto();
    dto.id = item.getId()!;
    dto.orderItemId = item.getOrderItemId();
    dto.productId = item.getProductId();
    dto.productName = item.getProductName();
    dto.operationId = item.getOperationId();
    dto.operationName = item.getOperationName();
    dto.quantity = item.getQuantity();
    dto.unit = item.getUnit();
    dto.estimatedHours = item.getEstimatedHours();
    dto.pieceRate = item.getPieceRate();
    dto.actualHours = item.getActualHours();
    return dto;
  }
}

export class WorkOrderResponseDto {
  id!: number;
  workOrderNumber!: string;
  orderId!: number;
  orderNumber!: string;
  departmentId!: number;
  departmentName!: string;
  operationId!: number;
  operationName!: string;
  status!: WorkOrderStatus;
  priority!: number;
  effectivePriority!: number;
  priorityOverride!: number | null;
  priorityOverrideReason!: string | null;
  deadline!: Date | null;
  assignedAt!: Date | null;
  startedAt!: Date | null;
  completedAt!: Date | null;
  items!: WorkOrderItemResponseDto[];
  totalEstimatedHours!: number;
  totalActualHours!: number | null;
  totalPieceRatePayment!: number;
  notes!: string | null;
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(workOrder: WorkOrder): WorkOrderResponseDto {
    const dto = new WorkOrderResponseDto();
    dto.id = workOrder.getId()!;
    dto.workOrderNumber = workOrder.getWorkOrderNumber();
    dto.orderId = workOrder.getOrderId();
    dto.orderNumber = workOrder.getOrderNumber();
    dto.departmentId = workOrder.getDepartmentId();
    dto.departmentName = workOrder.getDepartmentName();
    dto.operationId = workOrder.getOperationId();
    dto.operationName = workOrder.getOperationName();
    dto.status = workOrder.getStatus();
    dto.priority = workOrder.getPriority();
    dto.effectivePriority = workOrder.getEffectivePriority();
    dto.priorityOverride = workOrder.getPriorityOverride();
    dto.priorityOverrideReason = workOrder.getPriorityOverrideReason();
    dto.deadline = workOrder.getDeadline();
    dto.assignedAt = workOrder.getAssignedAt();
    dto.startedAt = workOrder.getStartedAt();
    dto.completedAt = workOrder.getCompletedAt();
    dto.items = workOrder.getItems().map(item => WorkOrderItemResponseDto.fromEntity(item));
    dto.totalEstimatedHours = workOrder.getTotalEstimatedHours();
    dto.totalActualHours = workOrder.getTotalActualHours();
    dto.totalPieceRatePayment = workOrder.getTotalPieceRatePayment();
    dto.notes = workOrder.getNotes();
    dto.createdAt = workOrder.getCreatedAt();
    dto.updatedAt = workOrder.getUpdatedAt();
    return dto;
  }
}

export class UpdateWorkOrderNotesDto {
  @IsString()
  notes!: string;
}

export class OverridePriorityDto {
  @IsNumber()
  newPriority!: number;

  @IsString()
  reason!: string;
}

export class RecordActualHoursDto {
  @IsNumber()
  itemId!: number;

  @IsNumber()
  actualHours!: number;
}

export class CancelWorkOrderDto {
  @IsString()
  reason!: string;
}

export class WorkOrderListQueryDto {
  @IsOptional()
  @IsNumber()
  orderId?: number;

  @IsOptional()
  @IsNumber()
  departmentId?: number;

  @IsOptional()
  @IsEnum(WorkOrderStatus)
  status?: WorkOrderStatus;

  @IsOptional()
  @IsNumber()
  minPriority?: number;

  @IsOptional()
  @IsNumber()
  maxPriority?: number;
}

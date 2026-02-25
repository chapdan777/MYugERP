import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkOrder } from '../../domain/entities/work-order.entity';
import { WorkOrderItem } from '../../domain/entities/work-order-item.entity';
import { WorkOrderStatus } from '../../domain/enums/work-order-status.enum';

/**
 * DTOs for Work Order REST API
 */

export class GenerateWorkOrdersDto {
  @ApiProperty({ description: 'ID заказа для генерации ЗН', example: 123 })
  @IsNumber()
  orderId!: number;
}

export class WorkOrderItemResponseDto {
  @ApiProperty({ description: 'ID позиции ЗН' })
  id!: number;

  @ApiProperty({ description: 'ID позиции заказа' })
  orderItemId!: number;

  @ApiProperty({ description: 'ID продукта' })
  productId!: number;

  @ApiProperty({ description: 'Название продукта' })
  productName!: string;

  @ApiProperty({ description: 'ID операции' })
  operationId!: number;

  @ApiProperty({ description: 'Название операции' })
  operationName!: string;

  @ApiProperty({ description: 'Количество' })
  quantity!: number;

  @ApiProperty({ description: 'Единица измерения' })
  unit!: string;

  @ApiProperty({ description: 'Расчетное время (часы)' })
  estimatedHours!: number;

  @ApiProperty({ description: 'Сдельная оплата' })
  pieceRate!: number;

  @ApiPropertyOptional({ description: 'Фактическое время (часы)' })
  actualHours!: number | null;

  @ApiPropertyOptional({ description: 'Расчитанные материалы и параметры' })
  calculatedMaterials!: any;

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
    dto.calculatedMaterials = item.getCalculatedMaterials();
    return dto;
  }
}

export class WorkOrderResponseDto {
  @ApiProperty({ description: 'ID заказ-наряда' })
  id!: number;

  @ApiProperty({ description: 'Номер заказ-наряда', example: 'WO-123-OP1' })
  workOrderNumber!: string;

  @ApiProperty({ description: 'ID заказа' })
  orderId!: number;

  @ApiProperty({ description: 'Номер заказа' })
  orderNumber!: string;

  @ApiProperty({ description: 'ID цеха' })
  departmentId!: number;

  @ApiProperty({ description: 'Название цеха' })
  departmentName!: string;

  @ApiProperty({ description: 'ID операции' })
  operationId!: number;

  @ApiProperty({ description: 'Название операции' })
  operationName!: string;

  @ApiProperty({ enum: WorkOrderStatus, description: 'Статус ЗН' })
  status!: WorkOrderStatus;

  @ApiProperty({ description: 'Приоритет' })
  priority!: number;

  @ApiProperty({ description: 'Эффективный приоритет' })
  effectivePriority!: number;

  @ApiPropertyOptional({ description: 'Переопределенный приоритет' })
  priorityOverride!: number | null;

  @ApiPropertyOptional({ description: 'Причина переопределения приоритета' })
  priorityOverrideReason!: string | null;

  @ApiPropertyOptional({ description: 'Дедлайн' })
  deadline!: Date | null;

  @ApiPropertyOptional({ description: 'Дата назначения' })
  assignedAt!: Date | null;

  @ApiPropertyOptional({ description: 'Дата начала' })
  startedAt!: Date | null;

  @ApiPropertyOptional({ description: 'Дата завершения' })
  completedAt!: Date | null;

  @ApiProperty({ type: [WorkOrderItemResponseDto], description: 'Позиции ЗН' })
  items!: WorkOrderItemResponseDto[];

  @ApiProperty({ description: 'Общее расчетное время' })
  totalEstimatedHours!: number;

  @ApiPropertyOptional({ description: 'Общее фактическое время' })
  totalActualHours!: number | null;

  @ApiProperty({ description: 'Общая сдельная оплата' })
  totalPieceRatePayment!: number;

  @ApiPropertyOptional({ description: 'Заметки' })
  notes!: string | null;

  @ApiProperty({ description: 'Дата создания' })
  createdAt!: Date;

  @ApiProperty({ description: 'Дата обновления' })
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
  @ApiProperty({ description: 'Заметки к ЗН' })
  @IsString()
  notes!: string;
}

export class OverridePriorityDto {
  @ApiProperty({ description: 'Новый приоритет' })
  @IsNumber()
  newPriority!: number;

  @ApiProperty({ description: 'Причина изменения приоритета' })
  @IsString()
  reason!: string;
}

export class RecordActualHoursDto {
  @ApiProperty({ description: 'ID позиции ЗН' })
  @IsNumber()
  itemId!: number;

  @ApiProperty({ description: 'Фактически затраченное время (часы)' })
  @IsNumber()
  actualHours!: number;
}

export class CancelWorkOrderDto {
  @ApiProperty({ description: 'Причина отмены' })
  @IsString()
  reason!: string;
}

export class WorkOrderListQueryDto {
  @ApiPropertyOptional({ description: 'Фильтр по ID заказа' })
  @IsOptional()
  @IsNumber()
  orderId?: number;

  @ApiPropertyOptional({ description: 'Фильтр по ID цеха' })
  @IsOptional()
  @IsNumber()
  departmentId?: number;

  @ApiPropertyOptional({ enum: WorkOrderStatus, description: 'Фильтр по статусу' })
  @IsOptional()
  @IsEnum(WorkOrderStatus)
  status?: WorkOrderStatus;

  @ApiPropertyOptional({ description: 'Минимальный приоритет' })
  @IsOptional()
  @IsNumber()
  minPriority?: number;

  @ApiPropertyOptional({ description: 'Максимальный приоритет' })
  @IsOptional()
  @IsNumber()
  maxPriority?: number;
}

import { Injectable, Logger, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WorkOrderGateway } from '../../presentation/gateways/work-order.gateway';
import { WorkOrderStatusChangedEvent } from '../../domain/events/work-order-status-changed.event';
import { WorkOrderCreatedEvent } from '../../domain/events/work-order-created.event';
import { WorkOrderAssignedEvent } from '../../domain/events/work-order-assigned.event';
import { WorkOrderPriorityOverriddenEvent } from '../../domain/events/work-order-priority-overridden.event';
import { WorkOrderActualHoursRecordedEvent } from '../../domain/events/work-order-actual-hours-recorded.event';
import { WorkOrderStartedEvent } from '../../domain/events/work-order-started.event';
import { WorkOrderSentToQualityCheckEvent } from '../../domain/events/work-order-sent-to-quality-check.event';
import { WorkOrderCompletedEvent } from '../../domain/events/work-order-completed.event';
import { WorkOrderCancelledEvent } from '../../domain/events/work-order-cancelled.event';
import { IWorkOrderRepository, WORK_ORDER_REPOSITORY } from '../../domain/repositories/work-order.repository.interface';

/**
 * Event Handler for Work Order Domain Events
 * 
 * Listens to domain events and emits corresponding WebSocket events
 * for real-time updates to connected clients
 */
@Injectable()
export class WorkOrderEventsHandler {
  private readonly logger = new Logger(WorkOrderEventsHandler.name);

  constructor(
    private readonly workOrderGateway: WorkOrderGateway,
    @Inject(WORK_ORDER_REPOSITORY)
    private readonly workOrderRepository: IWorkOrderRepository,
  ) {}

  /**
   * Handle WorkOrderStatusChanged event
   */
  @OnEvent('work-order.status-changed')
  async handleStatusChanged(event: WorkOrderStatusChangedEvent): Promise<void> {
    this.logger.log(
      `Handling status changed event: ${event.workOrderNumber} ${event.previousStatus} → ${event.newStatus}`,
    );

    // Need to fetch work order to get departmentId
    const workOrder = await this.workOrderRepository.findById(event.workOrderId);
    if (!workOrder) {
      this.logger.warn(`Work order ${event.workOrderId} not found for status change event`);
      return;
    }

    this.workOrderGateway.emitWorkOrderStatusChanged({
      workOrderId: event.workOrderId,
      workOrderNumber: event.workOrderNumber,
      departmentId: workOrder.getDepartmentId(),
      oldStatus: event.previousStatus,
      newStatus: event.newStatus,
      changedAt: event.changedAt,
      changedBy: event.changedBy,
    });

    // Also trigger Kanban board update
    this.workOrderGateway.emitKanbanBoardUpdated({
      departmentId: workOrder.getDepartmentId(),
      updatedAt: event.changedAt,
      reason: `Status changed to ${event.newStatus}`,
    });
  }

  /**
   * Handle WorkOrderCreated event
   */
  @OnEvent('work-order.created')
  handleCreated(event: WorkOrderCreatedEvent): void {
    this.logger.log(`Handling work order created event: ${event.workOrderNumber}`);

    this.workOrderGateway.emitWorkOrderCreated({
      workOrderId: event.workOrderId,
      workOrderNumber: event.workOrderNumber,
      departmentId: event.departmentId,
      orderId: event.orderId,
      orderNumber: event.orderNumber,
      operationId: event.operationId,
      operationName: '', // Not available in event, will be fetched by client if needed
      priority: event.priority,
      createdAt: event.createdAt,
    });

    // Also trigger Kanban board update
    this.workOrderGateway.emitKanbanBoardUpdated({
      departmentId: event.departmentId,
      updatedAt: event.createdAt,
      reason: 'Work order created',
    });
  }

  /**
   * Handle WorkOrderAssigned event
   */
  @OnEvent('work-order.assigned')
  handleAssigned(event: WorkOrderAssignedEvent): void {
    this.logger.log(`Handling work order assigned event: ${event.workOrderNumber}`);

    this.workOrderGateway.emitWorkOrderAssigned({
      workOrderId: event.workOrderId,
      workOrderNumber: event.workOrderNumber,
      departmentId: event.departmentId,
      workerId: 0, // Will be added when worker assignment is implemented
      workerName: event.departmentName,
      assignedAt: event.assignedAt,
    });

    // Also trigger Kanban board update
    this.workOrderGateway.emitKanbanBoardUpdated({
      departmentId: event.departmentId,
      updatedAt: event.assignedAt,
      reason: 'Work order assigned',
    });
  }

  /**
   * Handle WorkOrderPriorityOverridden event
   */
  @OnEvent('work-order.priority-overridden')
  async handlePriorityOverridden(event: WorkOrderPriorityOverriddenEvent): Promise<void> {
    this.logger.log(
      `Handling priority overridden event: ${event.workOrderNumber} ${event.previousPriority} → ${event.newPriority}`,
    );

    // Need to fetch work order to get departmentId
    const workOrder = await this.workOrderRepository.findById(event.workOrderId);
    if (!workOrder) {
      this.logger.warn(`Work order ${event.workOrderId} not found for priority override event`);
      return;
    }

    this.workOrderGateway.emitWorkOrderPriorityChanged({
      workOrderId: event.workOrderId,
      workOrderNumber: event.workOrderNumber,
      departmentId: workOrder.getDepartmentId(),
      oldPriority: event.previousPriority,
      newPriority: event.newPriority,
      reason: event.reason,
      changedBy: event.overriddenBy ?? 0,
      changedAt: event.overriddenAt,
    });

    // Also trigger Kanban board update
    this.workOrderGateway.emitKanbanBoardUpdated({
      departmentId: workOrder.getDepartmentId(),
      updatedAt: event.overriddenAt,
      reason: 'Priority changed',
    });
  }

  /**
   * Handle WorkOrderActualHoursRecorded event
   */
  @OnEvent('work-order.actual-hours-recorded')
  async handleActualHoursRecorded(event: WorkOrderActualHoursRecordedEvent): Promise<void> {
    this.logger.log(
      `Handling actual hours recorded event: ${event.workOrderNumber} - Item ${event.itemId}`,
    );

    // Need to fetch work order to get full details
    const workOrder = await this.workOrderRepository.findById(event.workOrderId);
    if (!workOrder) {
      this.logger.warn(`Work order ${event.workOrderId} not found for actual hours event`);
      return;
    }

    const totalEstimatedHours = workOrder.getTotalEstimatedHours();
    const totalActualHours = workOrder.getTotalActualHours() ?? 0;

    // Calculate progress percentage
    const progressPercentage = totalEstimatedHours > 0
      ? (totalActualHours / totalEstimatedHours) * 100
      : 0;

    this.workOrderGateway.emitWorkOrderProgressUpdated({
      workOrderId: event.workOrderId,
      workOrderNumber: event.workOrderNumber,
      departmentId: workOrder.getDepartmentId(),
      itemId: event.itemId,
      actualHours: event.actualHours,
      totalActualHours,
      totalEstimatedHours,
      progressPercentage,
      updatedAt: event.recordedAt,
    });
  }

  /**
   * Handle WorkOrderStarted event
   */
  @OnEvent('work-order.started')
  handleStarted(event: WorkOrderStartedEvent): void {
    this.logger.log(`Handling work order started event: ${event.workOrderNumber}`);

    // Emit status change
    this.workOrderGateway.emitWorkOrderStatusChanged({
      workOrderId: event.workOrderId,
      workOrderNumber: event.workOrderNumber,
      departmentId: event.departmentId,
      oldStatus: 'ASSIGNED',
      newStatus: 'IN_PROGRESS',
      changedAt: event.startedAt,
    });

    // Trigger Kanban board update
    this.workOrderGateway.emitKanbanBoardUpdated({
      departmentId: event.departmentId,
      updatedAt: event.startedAt,
      reason: 'Work order started',
    });
  }

  /**
   * Handle WorkOrderSentToQualityCheck event
   */
  @OnEvent('work-order.sent-to-quality-check')
  handleSentToQualityCheck(event: WorkOrderSentToQualityCheckEvent): void {
    this.logger.log(
      `Handling work order sent to quality check event: ${event.workOrderNumber}`,
    );

    // Emit status change
    this.workOrderGateway.emitWorkOrderStatusChanged({
      workOrderId: event.workOrderId,
      workOrderNumber: event.workOrderNumber,
      departmentId: event.departmentId,
      oldStatus: 'IN_PROGRESS',
      newStatus: 'QUALITY_CHECK',
      changedAt: event.sentToQualityCheckAt,
    });

    // Trigger Kanban board update
    this.workOrderGateway.emitKanbanBoardUpdated({
      departmentId: event.departmentId,
      updatedAt: event.sentToQualityCheckAt,
      reason: 'Work order sent to quality check',
    });
  }

  /**
   * Handle WorkOrderCompleted event
   */
  @OnEvent('work-order.completed')
  handleCompleted(event: WorkOrderCompletedEvent): void {
    this.logger.log(`Handling work order completed event: ${event.workOrderNumber}`);

    // Emit status change
    this.workOrderGateway.emitWorkOrderStatusChanged({
      workOrderId: event.workOrderId,
      workOrderNumber: event.workOrderNumber,
      departmentId: event.departmentId,
      oldStatus: 'QUALITY_CHECK',
      newStatus: 'COMPLETED',
      changedAt: event.completedAt,
    });

    // Trigger Kanban board update
    this.workOrderGateway.emitKanbanBoardUpdated({
      departmentId: event.departmentId,
      updatedAt: event.completedAt,
      reason: 'Work order completed',
    });
  }

  /**
   * Handle WorkOrderCancelled event
   */
  @OnEvent('work-order.cancelled')
  async handleCancelled(event: WorkOrderCancelledEvent): Promise<void> {
    this.logger.log(`Handling work order cancelled event: ${event.workOrderNumber}`);

    // Need to fetch work order to get departmentId
    const workOrder = await this.workOrderRepository.findById(event.workOrderId);
    if (!workOrder) {
      this.logger.warn(`Work order ${event.workOrderId} not found for cancelled event`);
      return;
    }

    // Emit status change
    this.workOrderGateway.emitWorkOrderStatusChanged({
      workOrderId: event.workOrderId,
      workOrderNumber: event.workOrderNumber,
      departmentId: workOrder.getDepartmentId(),
      oldStatus: 'IN_PROGRESS', // Assumption, could be any non-cancelled status
      newStatus: 'CANCELLED',
      changedAt: event.cancelledAt,
    });

    // Trigger Kanban board update
    this.workOrderGateway.emitKanbanBoardUpdated({
      departmentId: workOrder.getDepartmentId(),
      updatedAt: event.cancelledAt,
      reason: 'Work order cancelled',
    });
  }
}

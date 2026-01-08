import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { IWorkOrderRepository, WORK_ORDER_REPOSITORY } from '../../domain/repositories/work-order.repository.interface';
import { WorkOrderStateMachineService } from '../../domain/services/work-order-state-machine.service';
import { WorkOrderStatus } from '../../domain/enums/work-order-status.enum';
import {
  KanbanBoardDto,
  KanbanColumnDto,
  MoveWorkOrderDto,
} from '../dtos/kanban.dto';
import { WorkOrderResponseDto } from '../dtos/work-order.dto';
import { IProductionDepartmentRepository, PRODUCTION_DEPARTMENT_REPOSITORY } from '../../../production/domain/repositories/production-department.repository.interface';

/**
 * Kanban Board Controller
 * 
 * Provides REST API for Kanban board visualization and drag-and-drop operations
 */
@Controller('kanban')
export class KanbanController {
  constructor(
    @Inject(WORK_ORDER_REPOSITORY)
    private readonly workOrderRepository: IWorkOrderRepository,
    @Inject(PRODUCTION_DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: IProductionDepartmentRepository,
    private readonly stateMachineService: WorkOrderStateMachineService,
  ) {}

  /**
   * Get Kanban board for a specific department
   * Returns work orders grouped by status columns
   */
  @Get('department/:departmentId')
  async getDepartmentBoard(
    @Param('departmentId', ParseIntPipe) departmentId: number,
  ): Promise<KanbanBoardDto> {
    // Get department info
    const department = await this.departmentRepository.findById(departmentId);
    if (!department) {
      throw new Error(`Department with ID ${departmentId} not found`);
    }

    // Get all work orders for this department
    const workOrders = await this.workOrderRepository.findByDepartmentId(departmentId);

    // Define column order for Kanban board
    const columnStatuses: WorkOrderStatus[] = [
      WorkOrderStatus.PLANNED,
      WorkOrderStatus.ASSIGNED,
      WorkOrderStatus.IN_PROGRESS,
      WorkOrderStatus.QUALITY_CHECK,
      WorkOrderStatus.COMPLETED,
    ];

    const columnLabels: Record<WorkOrderStatus, string> = {
      [WorkOrderStatus.PLANNED]: 'Planned',
      [WorkOrderStatus.ASSIGNED]: 'Assigned',
      [WorkOrderStatus.IN_PROGRESS]: 'In Progress',
      [WorkOrderStatus.QUALITY_CHECK]: 'Quality Check',
      [WorkOrderStatus.COMPLETED]: 'Completed',
      [WorkOrderStatus.CANCELLED]: 'Cancelled',
    };

    // Group work orders by status
    const columns: KanbanColumnDto[] = columnStatuses.map(status => {
      const statusWorkOrders = workOrders.filter(wo => wo.getStatus() === status);
      
      const totalEstimatedHours = statusWorkOrders.reduce(
        (sum, wo) => sum + wo.getTotalEstimatedHours(),
        0,
      );

      const totalActualHours = statusWorkOrders.reduce((sum, wo) => {
        const hours = wo.getTotalActualHours();
        return sum + (hours || 0);
      }, 0);

      return {
        status,
        label: columnLabels[status],
        workOrders: statusWorkOrders.map(wo => WorkOrderResponseDto.fromEntity(wo)),
        count: statusWorkOrders.length,
        totalEstimatedHours,
        totalActualHours,
      };
    });

    return {
      departmentId,
      departmentName: department.getName(),
      columns,
      totalWorkOrders: workOrders.length,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get all Kanban boards (one per department)
   */
  @Get('boards')
  async getAllBoards(): Promise<KanbanBoardDto[]> {
    const departments = await this.departmentRepository.findAllActive();
    
    const boards = await Promise.all(
      departments.map(dept => this.getDepartmentBoard(dept.getId()!)),
    );

    return boards;
  }

  /**
   * Get work orders by status for a department (single column)
   */
  @Get('department/:departmentId/status/:status')
  async getColumnWorkOrders(
    @Param('departmentId', ParseIntPipe) departmentId: number,
    @Param('status') status: WorkOrderStatus,
  ): Promise<WorkOrderResponseDto[]> {
    const workOrders = await this.workOrderRepository.findByDepartmentIdAndStatus(
      departmentId,
      status,
    );

    return workOrders.map(wo => WorkOrderResponseDto.fromEntity(wo));
  }

  /**
   * Move work order to different status (drag-and-drop)
   * This endpoint handles status transitions via Kanban board
   */
  @Post('move')
  @HttpCode(HttpStatus.OK)
  async moveWorkOrder(@Body() dto: MoveWorkOrderDto): Promise<WorkOrderResponseDto> {
    const workOrder = await this.workOrderRepository.findById(dto.workOrderId);
    if (!workOrder) {
      throw new Error(`Work order with ID ${dto.workOrderId} not found`);
    }

    const currentStatus = workOrder.getStatus();
    const targetStatus = dto.targetStatus;

    // Check if transition is allowed
    if (!this.stateMachineService.canTransitionTo(workOrder, targetStatus)) {
      throw new Error(
        `Cannot transition from ${currentStatus} to ${targetStatus}. ` +
        `Allowed transitions: ${this.stateMachineService.getAvailableTransitions(workOrder).join(', ')}`,
      );
    }

    // Perform the appropriate transition
    switch (targetStatus) {
      case WorkOrderStatus.ASSIGNED:
        this.stateMachineService.transitionToAssigned(workOrder);
        break;

      case WorkOrderStatus.IN_PROGRESS:
        this.stateMachineService.transitionToInProgress(workOrder);
        break;

      case WorkOrderStatus.QUALITY_CHECK:
        this.stateMachineService.transitionToQualityCheck(workOrder);
        break;

      case WorkOrderStatus.COMPLETED:
        this.stateMachineService.transitionToCompleted(workOrder);
        break;

      case WorkOrderStatus.CANCELLED:
        this.stateMachineService.transitionToCancelled(workOrder, 'Moved to cancelled via Kanban');
        break;

      default:
        throw new Error(`Unsupported target status: ${targetStatus}`);
    }

    // Save and return
    const updated = await this.workOrderRepository.save(workOrder);
    return WorkOrderResponseDto.fromEntity(updated);
  }

  /**
   * Get available target statuses for a work order (for UI)
   */
  @Get('work-order/:workOrderId/available-moves')
  async getAvailableMoves(
    @Param('workOrderId', ParseIntPipe) workOrderId: number,
  ): Promise<{ availableStatuses: WorkOrderStatus[] }> {
    const workOrder = await this.workOrderRepository.findById(workOrderId);
    if (!workOrder) {
      throw new Error(`Work order with ID ${workOrderId} not found`);
    }

    const availableStatuses = this.stateMachineService.getAvailableTransitions(workOrder);
    return { availableStatuses };
  }

  /**
   * Get Kanban board statistics
   */
  @Get('department/:departmentId/statistics')
  async getBoardStatistics(
    @Param('departmentId', ParseIntPipe) departmentId: number,
  ): Promise<{
    totalWorkOrders: number;
    byStatus: Record<WorkOrderStatus, number>;
    totalEstimatedHours: number;
    totalActualHours: number;
    completionRate: number;
    averageCycleTime: number | null;
  }> {
    const workOrders = await this.workOrderRepository.findByDepartmentId(departmentId);

    // Count by status
    const byStatus = {
      [WorkOrderStatus.PLANNED]: 0,
      [WorkOrderStatus.ASSIGNED]: 0,
      [WorkOrderStatus.IN_PROGRESS]: 0,
      [WorkOrderStatus.QUALITY_CHECK]: 0,
      [WorkOrderStatus.COMPLETED]: 0,
      [WorkOrderStatus.CANCELLED]: 0,
    };

    workOrders.forEach(wo => {
      byStatus[wo.getStatus()]++;
    });

    // Calculate totals
    const totalEstimatedHours = workOrders.reduce(
      (sum, wo) => sum + wo.getTotalEstimatedHours(),
      0,
    );

    const totalActualHours = workOrders.reduce((sum, wo) => {
      const hours = wo.getTotalActualHours();
      return sum + (hours || 0);
    }, 0);

    // Calculate completion rate
    const completedCount = byStatus[WorkOrderStatus.COMPLETED];
    const completionRate = workOrders.length > 0 
      ? (completedCount / workOrders.length) * 100 
      : 0;

    // Calculate average cycle time (from assigned to completed)
    const completedWorkOrders = workOrders.filter(wo => wo.isCompleted());
    let averageCycleTime: number | null = null;

    if (completedWorkOrders.length > 0) {
      const cycleTimes = completedWorkOrders
        .map(wo => {
          const assigned = wo.getAssignedAt();
          const completed = wo.getCompletedAt();
          if (!assigned || !completed) return null;
          return completed.getTime() - assigned.getTime();
        })
        .filter((time): time is number => time !== null);

      if (cycleTimes.length > 0) {
        const totalCycleTime = cycleTimes.reduce((sum, time) => sum + time, 0);
        // Convert to hours
        averageCycleTime = totalCycleTime / cycleTimes.length / (1000 * 60 * 60);
      }
    }

    return {
      totalWorkOrders: workOrders.length,
      byStatus,
      totalEstimatedHours,
      totalActualHours,
      completionRate,
      averageCycleTime,
    };
  }

  /**
   * Get work orders that are overdue
   */
  @Get('department/:departmentId/overdue')
  async getOverdueWorkOrders(
    @Param('departmentId', ParseIntPipe) departmentId: number,
  ): Promise<WorkOrderResponseDto[]> {
    const workOrders = await this.workOrderRepository.findByDepartmentId(departmentId);
    const now = new Date();

    const overdueWorkOrders = workOrders.filter(wo => {
      if (wo.isCompleted() || wo.isCancelled()) {
        return false;
      }
      const deadline = wo.getDeadline();
      return deadline && deadline < now;
    });

    return overdueWorkOrders.map(wo => WorkOrderResponseDto.fromEntity(wo));
  }
}

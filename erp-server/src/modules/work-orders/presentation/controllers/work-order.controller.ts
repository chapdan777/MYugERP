import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { IWorkOrderRepository, WORK_ORDER_REPOSITORY } from '../../domain/repositories/work-order.repository.interface';
import { WorkOrderStateMachineService } from '../../domain/services/work-order-state-machine.service';
import { WorkOrderPriorityService } from '../../domain/services/work-order-priority.service';
import {
  WorkOrderResponseDto,
  UpdateWorkOrderNotesDto,
  OverridePriorityDto,
  RecordActualHoursDto,
  CancelWorkOrderDto,
  WorkOrderListQueryDto,
} from '../dtos/work-order.dto';

@Controller('work-orders')
export class WorkOrderController {
  constructor(
    @Inject(WORK_ORDER_REPOSITORY)
    private readonly workOrderRepository: IWorkOrderRepository,
    private readonly stateMachineService: WorkOrderStateMachineService,
    private readonly priorityService: WorkOrderPriorityService,
  ) {}

  /**
   * Generate work orders from an order
   */
  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  async generateWorkOrders(): Promise<WorkOrderResponseDto[]> {
    // This would be implemented as a use case
    // For now, return empty array as placeholder
    throw new Error('Not implemented - requires GenerateWorkOrdersUseCase');
  }

  /**
   * Get all work orders with optional filtering
   */
  @Get()
  async findAll(@Query() query: WorkOrderListQueryDto): Promise<WorkOrderResponseDto[]> {
    let workOrders;

    if (query.orderId) {
      workOrders = await this.workOrderRepository.findByOrderId(query.orderId);
    } else if (query.departmentId && query.status) {
      workOrders = await this.workOrderRepository.findByDepartmentIdAndStatus(
        query.departmentId,
        query.status,
      );
    } else if (query.departmentId) {
      workOrders = await this.workOrderRepository.findByDepartmentId(query.departmentId);
    } else if (query.status) {
      workOrders = await this.workOrderRepository.findByStatus(query.status);
    } else {
      workOrders = await this.workOrderRepository.findAll();
    }

    // Apply priority filters if specified
    if (query.minPriority !== undefined || query.maxPriority !== undefined) {
      workOrders = workOrders.filter(wo => {
        const priority = wo.getEffectivePriority();
        if (query.minPriority !== undefined && priority < query.minPriority) {
          return false;
        }
        if (query.maxPriority !== undefined && priority > query.maxPriority) {
          return false;
        }
        return true;
      });
    }

    return workOrders.map(wo => WorkOrderResponseDto.fromEntity(wo));
  }

  /**
   * Get work order by ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<WorkOrderResponseDto> {
    const workOrder = await this.workOrderRepository.findById(id);
    if (!workOrder) {
      throw new Error(`Work order with ID ${id} not found`);
    }
    return WorkOrderResponseDto.fromEntity(workOrder);
  }

  /**
   * Assign work order (transition to ASSIGNED)
   */
  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
  async assign(@Param('id', ParseIntPipe) id: number): Promise<WorkOrderResponseDto> {
    const workOrder = await this.workOrderRepository.findById(id);
    if (!workOrder) {
      throw new Error(`Work order with ID ${id} not found`);
    }

    this.stateMachineService.transitionToAssigned(workOrder);
    const updated = await this.workOrderRepository.save(workOrder);
    return WorkOrderResponseDto.fromEntity(updated);
  }

  /**
   * Start work order (transition to IN_PROGRESS)
   */
  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  async start(@Param('id', ParseIntPipe) id: number): Promise<WorkOrderResponseDto> {
    const workOrder = await this.workOrderRepository.findById(id);
    if (!workOrder) {
      throw new Error(`Work order with ID ${id} not found`);
    }

    this.stateMachineService.transitionToInProgress(workOrder);
    const updated = await this.workOrderRepository.save(workOrder);
    return WorkOrderResponseDto.fromEntity(updated);
  }

  /**
   * Send work order to quality check
   */
  @Post(':id/quality-check')
  @HttpCode(HttpStatus.OK)
  async sendToQualityCheck(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WorkOrderResponseDto> {
    const workOrder = await this.workOrderRepository.findById(id);
    if (!workOrder) {
      throw new Error(`Work order with ID ${id} not found`);
    }

    this.stateMachineService.transitionToQualityCheck(workOrder);
    const updated = await this.workOrderRepository.save(workOrder);
    return WorkOrderResponseDto.fromEntity(updated);
  }

  /**
   * Complete work order (after quality check passed)
   */
  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  async complete(@Param('id', ParseIntPipe) id: number): Promise<WorkOrderResponseDto> {
    const workOrder = await this.workOrderRepository.findById(id);
    if (!workOrder) {
      throw new Error(`Work order with ID ${id} not found`);
    }

    this.stateMachineService.transitionToCompleted(workOrder);
    const updated = await this.workOrderRepository.save(workOrder);
    return WorkOrderResponseDto.fromEntity(updated);
  }

  /**
   * Cancel work order
   */
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelWorkOrderDto,
  ): Promise<WorkOrderResponseDto> {
    const workOrder = await this.workOrderRepository.findById(id);
    if (!workOrder) {
      throw new Error(`Work order with ID ${id} not found`);
    }

    this.stateMachineService.transitionToCancelled(workOrder, dto.reason);
    const updated = await this.workOrderRepository.save(workOrder);
    return WorkOrderResponseDto.fromEntity(updated);
  }

  /**
   * Update work order notes
   */
  @Put(':id/notes')
  async updateNotes(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWorkOrderNotesDto,
  ): Promise<WorkOrderResponseDto> {
    const workOrder = await this.workOrderRepository.findById(id);
    if (!workOrder) {
      throw new Error(`Work order with ID ${id} not found`);
    }

    workOrder.updateNotes(dto.notes);
    const updated = await this.workOrderRepository.save(workOrder);
    return WorkOrderResponseDto.fromEntity(updated);
  }

  /**
   * Override work order priority
   */
  @Post(':id/priority-override')
  @HttpCode(HttpStatus.OK)
  async overridePriority(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: OverridePriorityDto,
  ): Promise<WorkOrderResponseDto> {
    const workOrder = await this.workOrderRepository.findById(id);
    if (!workOrder) {
      throw new Error(`Work order with ID ${id} not found`);
    }

    this.priorityService.applyPriorityOverride(workOrder, {
      workOrderId: id,
      newPriority: dto.newPriority,
      reason: dto.reason,
      requestedBy: 1, // TODO: Get from authenticated user
    });

    const updated = await this.workOrderRepository.save(workOrder);
    return WorkOrderResponseDto.fromEntity(updated);
  }

  /**
   * Clear priority override
   */
  @Post(':id/priority-override/clear')
  @HttpCode(HttpStatus.OK)
  async clearPriorityOverride(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WorkOrderResponseDto> {
    const workOrder = await this.workOrderRepository.findById(id);
    if (!workOrder) {
      throw new Error(`Work order with ID ${id} not found`);
    }

    workOrder.clearPriorityOverride();
    const updated = await this.workOrderRepository.save(workOrder);
    return WorkOrderResponseDto.fromEntity(updated);
  }

  /**
   * Record actual hours for a work order item
   */
  @Post(':id/actual-hours')
  @HttpCode(HttpStatus.OK)
  async recordActualHours(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RecordActualHoursDto,
  ): Promise<WorkOrderResponseDto> {
    const workOrder = await this.workOrderRepository.findById(id);
    if (!workOrder) {
      throw new Error(`Work order with ID ${id} not found`);
    }

    // Find item and record hours
    const item = workOrder.getItems().find(i => i.getId() === dto.itemId);
    if (!item) {
      throw new Error(`Item with ID ${dto.itemId} not found in work order`);
    }

    item.recordActualHours(dto.actualHours);
    const updated = await this.workOrderRepository.save(workOrder);
    return WorkOrderResponseDto.fromEntity(updated);
  }

  /**
   * Get available transitions for a work order
   */
  @Get(':id/available-transitions')
  async getAvailableTransitions(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ transitions: string[] }> {
    const workOrder = await this.workOrderRepository.findById(id);
    if (!workOrder) {
      throw new Error(`Work order with ID ${id} not found`);
    }

    const transitions = this.stateMachineService.getAvailableTransitions(workOrder);
    return { transitions };
  }

  /**
   * Get work order progress percentage
   */
  @Get(':id/progress')
  async getProgress(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ progress: number }> {
    const workOrder = await this.workOrderRepository.findById(id);
    if (!workOrder) {
      throw new Error(`Work order with ID ${id} not found`);
    }

    const progress = this.stateMachineService.getProgressPercentage(workOrder);
    return { progress };
  }

  /**
   * Get priority statistics for work orders
   */
  @Get('statistics/priority')
  async getPriorityStats(
    @Query() query: WorkOrderListQueryDto,
  ): Promise<ReturnType<WorkOrderPriorityService['getPriorityStats']>> {
    // Get filtered work orders
    let workOrders;
    
    if (query.departmentId) {
      workOrders = await this.workOrderRepository.findByDepartmentId(query.departmentId);
    } else if (query.status) {
      workOrders = await this.workOrderRepository.findByStatus(query.status);
    } else {
      workOrders = await this.workOrderRepository.findAll();
    }

    return this.priorityService.getPriorityStats(workOrders);
  }
}

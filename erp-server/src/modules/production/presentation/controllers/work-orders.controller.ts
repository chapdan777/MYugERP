import { Controller, Post, Get, Body, Param, UseGuards, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { CreateWorkOrderDto } from '../dtos/create-work-order.dto';

@Controller('work-orders')
@UseGuards(JwtAuthGuard)
export class WorkOrdersController {

  private workOrders: any[] = [];

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createWorkOrderDto: CreateWorkOrderDto) {
    const newWorkOrder = {
      id: `wo-${Date.now()}`,
      ...createWorkOrderDto
    };
    this.workOrders.push(newWorkOrder);
    return newWorkOrder;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const workOrder = this.workOrders.find(wo => wo.id === id);
    if (!workOrder) {
      throw new NotFoundException(`Work order with ID ${id} not found`);
    }
    return workOrder;
  }
}
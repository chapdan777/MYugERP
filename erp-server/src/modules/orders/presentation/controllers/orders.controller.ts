import { Controller, Post, Get, Body, Param, UseGuards, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { CreateOrderDto } from '../dtos/create-order.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  
  // Временное хранилище
  private orders: any[] = [];

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createOrderDto: CreateOrderDto) {
    const newOrder = {
      id: `order-${Date.now()}`,
      ...createOrderDto
    };
    this.orders.push(newOrder);
    return newOrder;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const order = this.orders.find(o => o.id === id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }
}
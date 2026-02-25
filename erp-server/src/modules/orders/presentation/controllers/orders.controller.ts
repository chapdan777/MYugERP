import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { CreateOrderUseCase } from '../../application/use-cases/create-order.use-case';
import { GetOrdersUseCase } from '../../application/use-cases/get-orders.use-case';
import { GetOrderByIdUseCase } from '../../application/use-cases/get-order-by-id.use-case';
import { DeleteOrderUseCase } from '../../application/use-cases/delete-order.use-case';
import { UpdateOrderUseCase } from '../../application/use-cases/update-order.use-case';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {

  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly getOrdersUseCase: GetOrdersUseCase,
    private readonly getOrderByIdUseCase: GetOrderByIdUseCase,
    private readonly deleteOrderUseCase: DeleteOrderUseCase,
    private readonly updateOrderUseCase: UpdateOrderUseCase,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.createOrderUseCase.execute(createOrderDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateOrderDto: CreateOrderDto) {
    return this.updateOrderUseCase.execute(Number(id), updateOrderDto);
  }

  @Get()
  async findAll() {
    return this.getOrdersUseCase.execute();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.getOrderByIdUseCase.execute(Number(id));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.deleteOrderUseCase.execute(Number(id));
  }
}
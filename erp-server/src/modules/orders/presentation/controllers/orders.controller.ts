import { Controller, Post, Get, Body, Param, UseGuards, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { CreateOrderUseCase } from '../../application/use-cases/create-order.use-case';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {

  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.createOrderUseCase.execute(createOrderDto);
  }

  @Get(':id')
  findOne(@Param('id') _id: string) {
    // TODO: Connect to GetOrderUseCase or Repository
    throw new NotFoundException('Method not implemented for real DB yet');
  }
}
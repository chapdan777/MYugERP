import { Controller, Post, Get, Body, Param, UseGuards, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { CreatePaymentDto } from '../dtos/create-payment.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {

  private payments: any[] = [];

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPaymentDto: CreatePaymentDto) {
    const newPayment = {
      id: `pay-${Date.now()}`,
      ...createPaymentDto
    };
    this.payments.push(newPayment);
    return newPayment;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const payment = this.payments.find(p => p.id === id);
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }
}
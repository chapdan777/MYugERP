import { Controller, Post, Get, Body, Param, UseGuards, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { CreateOrderTemplateDto } from '../dtos/create-order-template.dto';

@Controller('order-templates')
@UseGuards(JwtAuthGuard)
export class OrderTemplatesController {

  private orderTemplates: any[] = [];

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createOrderTemplateDto: CreateOrderTemplateDto) {
    const newOrderTemplate = {
      id: `ot-${Date.now()}`,
      ...createOrderTemplateDto
    };
    this.orderTemplates.push(newOrderTemplate);
    return newOrderTemplate;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const orderTemplate = this.orderTemplates.find(ot => ot.id === id);
    if (!orderTemplate) {
      throw new NotFoundException(`Order template with ID ${id} not found`);
    }
    return orderTemplate;
  }
}
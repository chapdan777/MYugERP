import { Controller, Post, Get, Body, Param, UseGuards, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { CreatePriceModifierDto } from '../dtos/create-price-modifier.dto';

@Controller('price-modifiers')
@UseGuards(JwtAuthGuard)
export class PriceModifiersController {

  private priceModifiers: any[] = [];

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPriceModifierDto: CreatePriceModifierDto) {
    const newPriceModifier = {
      id: `pm-${Date.now()}`,
      ...createPriceModifierDto
    };
    this.priceModifiers.push(newPriceModifier);
    return newPriceModifier;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const priceModifier = this.priceModifiers.find(pm => pm.id === id);
    if (!priceModifier) {
      throw new NotFoundException(`Price modifier with ID ${id} not found`);
    }
    return priceModifier;
  }
}
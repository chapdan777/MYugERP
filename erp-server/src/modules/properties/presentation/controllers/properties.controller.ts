import { Controller, Post, Get, Body, Param, UseGuards, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { CreatePropertyDto } from '../dtos/create-property.dto';

@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertiesController {

  private properties: any[] = [];

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPropertyDto: CreatePropertyDto) {
    const newProperty = {
      id: `prop-${Date.now()}`,
      ...createPropertyDto
    };
    this.properties.push(newProperty);
    return newProperty;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const property = this.properties.find(p => p.id === id);
    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
    return property;
  }
}
import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AddItemToHeaderUseCase } from '../../application/use-cases/add-item-to-header.use-case';
import { GetHeaderItemsUseCase } from '../../application/use-cases/get-header-items.use-case';
import { AddItemToHeaderDto } from '../../application/dto/add-item-to-header.dto';

@ApiTags('property-headers')
@Controller('property-headers')
export class PropertyHeaderItemsController {
  constructor(
    private readonly addItemToHeaderUseCase: AddItemToHeaderUseCase,
    private readonly getHeaderItemsUseCase: GetHeaderItemsUseCase,
  ) {}

  @Post(':headerId/items')
  @ApiOperation({ summary: 'Добавить элемент в шапку' })
  @ApiResponse({ status: 201, description: 'Элемент успешно добавлен' })
  async addItem(
    @Param('headerId', ParseIntPipe) headerId: number,
    @Body() dto: AddItemToHeaderDto,
  ) {
    return await this.addItemToHeaderUseCase.execute(headerId, dto);
  }

  @Get(':headerId/items')
  @ApiOperation({ summary: 'Получить все элементы шапки' })
  @ApiResponse({ status: 200, description: 'Список элементов шапки' })
  async getItems(@Param('headerId', ParseIntPipe) headerId: number) {
    return await this.getHeaderItemsUseCase.execute(headerId);
  }

  @Put(':headerId/items/:propertyId')
  @ApiOperation({ summary: 'Обновить значение элемента шапки' })
  @ApiResponse({ status: 200, description: 'Элемент успешно обновлен' })
  async updateItemValue(
    @Param('headerId', ParseIntPipe) _headerId: number,
    @Param('propertyId', ParseIntPipe) _propertyId: number,
    @Body('value') _value: string,
  ) {
    // Note: This would require a separate use case for updating item values
    throw new Error('Not implemented yet');
  }

  @Delete(':headerId/items/:propertyId')
  @ApiOperation({ summary: 'Удалить элемент из шапки' })
  @ApiResponse({ status: 204, description: 'Элемент удален' })
  async removeItem(
    @Param('headerId', ParseIntPipe) _headerId: number,
    @Param('propertyId', ParseIntPipe) _propertyId: number,
  ) {
    // Note: This would require a separate use case for removing items
    throw new Error('Not implemented yet');
  }
}
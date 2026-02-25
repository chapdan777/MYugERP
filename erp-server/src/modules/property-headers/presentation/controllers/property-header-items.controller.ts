import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AddItemToHeaderUseCase } from '../../application/use-cases/add-item-to-header.use-case';
import { GetHeaderItemsUseCase } from '../../application/use-cases/get-header-items.use-case';
import { UpdateHeaderItemUseCase } from '../../application/use-cases/update-header-item.use-case';
import { RemoveItemFromHeaderUseCase } from '../../application/use-cases/remove-item-from-header.use-case';
import { AddItemToHeaderDto } from '../../application/dto/add-item-to-header.dto';
import { UpdateHeaderItemDto } from '../../application/dto/update-header-item.dto';

@ApiTags('property-headers')
@Controller('property-headers')
export class PropertyHeaderItemsController {
  constructor(
    private readonly addItemToHeaderUseCase: AddItemToHeaderUseCase,
    private readonly getHeaderItemsUseCase: GetHeaderItemsUseCase,
    private readonly updateHeaderItemUseCase: UpdateHeaderItemUseCase,
    private readonly removeItemFromHeaderUseCase: RemoveItemFromHeaderUseCase,
  ) { }

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
  @ApiOperation({ summary: 'Обновить элемент шапки' })
  @ApiResponse({ status: 200, description: 'Элемент успешно обновлен' })
  async updateItem(
    @Param('headerId', ParseIntPipe) headerId: number,
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: UpdateHeaderItemDto,
  ) {
    return await this.updateHeaderItemUseCase.execute(headerId, propertyId, dto);
  }

  @Delete(':headerId/items/:propertyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить элемент из шапки' })
  @ApiResponse({ status: 204, description: 'Элемент удален' })
  async removeItem(
    @Param('headerId', ParseIntPipe) headerId: number,
    @Param('propertyId', ParseIntPipe) propertyId: number,
  ) {
    await this.removeItemFromHeaderUseCase.execute(headerId, propertyId);
  }
}
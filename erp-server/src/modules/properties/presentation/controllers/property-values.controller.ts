import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatePropertyValueRequestDto, UpdatePropertyValueRequestDto, PropertyValueResponseDto } from '../dtos/property-value.dto';
import { CreatePropertyValueUseCase } from '../../application/use-cases/create-property-value.use-case';
import { GetPropertyValuesByPropertyIdUseCase } from '../../application/use-cases/get-property-values-by-property-id.use-case';
import { UpdatePropertyValueUseCase } from '../../application/use-cases/update-property-value.use-case';
import { DeletePropertyValueUseCase } from '../../application/use-cases/delete-property-value.use-case';

@ApiTags('property-values')
@Controller('property-values')
export class PropertyValuesController {
  constructor(
    private readonly createPropertyValueUseCase: CreatePropertyValueUseCase,
    private readonly getPropertyValuesByPropertyIdUseCase: GetPropertyValuesByPropertyIdUseCase,
    private readonly updatePropertyValueUseCase: UpdatePropertyValueUseCase,
    private readonly deletePropertyValueUseCase: DeletePropertyValueUseCase,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Создать значение свойства' })
  @ApiResponse({ status: 201, type: PropertyValueResponseDto })
  async create(@Body() dto: CreatePropertyValueRequestDto): Promise<PropertyValueResponseDto> {
    const propertyValue = await this.createPropertyValueUseCase.execute({
      propertyId: dto.propertyId,
      value: dto.value,
      priceModifierId: dto.priceModifierId,
      priceModifierValue: dto.priceModifierValue,
      displayOrder: dto.displayOrder,
    });

    return this.mapToResponse(propertyValue);
  }

  @Get('by-property/:propertyId')
  @ApiOperation({ summary: 'Получить значения по ID свойства' })
  @ApiResponse({ status: 200, type: [PropertyValueResponseDto] })
  async getByPropertyId(@Param('propertyId', ParseIntPipe) propertyId: number): Promise<PropertyValueResponseDto[]> {
    const propertyValues = await this.getPropertyValuesByPropertyIdUseCase.execute(propertyId);
    return propertyValues.map(pv => this.mapToResponse(pv));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить значение свойства' })
  @ApiResponse({ status: 200, type: PropertyValueResponseDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePropertyValueRequestDto
  ): Promise<PropertyValueResponseDto> {
    const propertyValue = await this.updatePropertyValueUseCase.execute(id, {
      value: dto.value,
      priceModifierId: dto.priceModifierId,
      priceModifierValue: dto.priceModifierValue,
      displayOrder: dto.displayOrder,
    });

    return this.mapToResponse(propertyValue);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить значение свойства' })
  @ApiResponse({ status: 200, description: 'Значение успешно удалено' })
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deletePropertyValueUseCase.execute(id);
  }

  private mapToResponse(propertyValue: any): PropertyValueResponseDto {
    const response = new PropertyValueResponseDto();
    response.id = propertyValue.getId();
    response.propertyId = propertyValue.getPropertyId();
    response.value = propertyValue.getValue();
    response.priceModifierId = propertyValue.getPriceModifierId();

    // Map full modifier object if available
    const modifier = propertyValue.getPriceModifier();
    if (modifier) {
      response.priceModifier = {
        id: modifier.getId()!,
        name: modifier.getName(),
        value: modifier.getValue(),
        type: modifier.getModifierType(),
        code: modifier.getCode()
      };
    } else {
      response.priceModifier = null;
    }

    response.displayOrder = propertyValue.getDisplayOrder();
    response.isActive = propertyValue.getIsActive();
    response.createdAt = propertyValue.getCreatedAt();
    response.updatedAt = propertyValue.getUpdatedAt();
    return response;
  }
}
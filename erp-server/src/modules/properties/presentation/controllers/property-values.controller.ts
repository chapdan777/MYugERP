import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatePropertyValueRequestDto, PropertyValueResponseDto } from '../dtos/property-value.dto';
import { CreatePropertyValueUseCase } from '../../application/use-cases/create-property-value.use-case';
import { GetPropertyValuesByPropertyIdUseCase } from '../../application/use-cases/get-property-values-by-property-id.use-case';


@ApiTags('property-values')
@Controller('property-values')
export class PropertyValuesController {
  constructor(
    private readonly createPropertyValueUseCase: CreatePropertyValueUseCase,
    private readonly getPropertyValuesByPropertyIdUseCase: GetPropertyValuesByPropertyIdUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Создать значение свойства' })
  @ApiResponse({ status: 201, type: PropertyValueResponseDto })
  async create(@Body() dto: CreatePropertyValueRequestDto): Promise<PropertyValueResponseDto> {
    const propertyValue = await this.createPropertyValueUseCase.execute({
      propertyId: dto.propertyId,
      value: dto.value,
      priceModifierId: dto.priceModifierId,
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

  private mapToResponse(propertyValue: any): PropertyValueResponseDto {
    const response = new PropertyValueResponseDto();
    response.id = propertyValue.getId();
    response.propertyId = propertyValue.getPropertyId();
    response.value = propertyValue.getValue();
    response.priceModifierId = propertyValue.getPriceModifierId();
    response.displayOrder = propertyValue.getDisplayOrder();
    response.isActive = propertyValue.getIsActive();
    response.createdAt = propertyValue.getCreatedAt();
    response.updatedAt = propertyValue.getUpdatedAt();
    return response;
  }
}
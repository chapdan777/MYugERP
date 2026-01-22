import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import {
  CreatePriceModifierRequestDto,
  UpdatePriceModifierRequestDto,
  PriceModifierResponseDto,
  PriceModifierResponseDtoSwagger,
} from '../dtos/price-modifier.dto';
import {
  CalculatePriceRequestDto,
  CalculatePriceResponseDto,
} from '../dtos/calculate-price.dto';
import { PriceModifier } from '../../domain/entities/price-modifier.entity';
import {
  CreatePriceModifierUseCase,
  GetPriceModifierByIdUseCase,
  GetAllActivePriceModifiersUseCase,
  UpdatePriceModifierUseCase,
  DeletePriceModifierUseCase,
  CalculatePriceUseCase,
} from '../../application/use-cases';

@ApiTags('pricing')
@ApiBearerAuth()
@Controller('price-modifiers')
@UseGuards(JwtAuthGuard)
export class PriceModifiersController {
  constructor(
    private readonly createPriceModifierUseCase: CreatePriceModifierUseCase,
    private readonly getPriceModifierByIdUseCase: GetPriceModifierByIdUseCase,
    private readonly getAllActivePriceModifiersUseCase: GetAllActivePriceModifiersUseCase,
    private readonly updatePriceModifierUseCase: UpdatePriceModifierUseCase,
    private readonly deletePriceModifierUseCase: DeletePriceModifierUseCase,
    private readonly calculatePriceUseCase: CalculatePriceUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Создать модификатор цены',
    description: 'Создает новый модификатор цены. Можно использовать простые условия (propertyId/propertyValue) или сложные выражения (conditionExpression).'
  })
  @ApiBody({ type: CreatePriceModifierRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Модификатор цены успешно создан',
    type: PriceModifierResponseDtoSwagger,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные запроса' })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiResponse({ status: 409, description: 'Модификатор с таким кодом уже существует' })
  async create(@Body() dto: CreatePriceModifierRequestDto) {
    const modifier = await this.createPriceModifierUseCase.execute(dto);
    return this.toPriceModifierResponseDto(modifier);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех модификаторов цен' })
  @ApiResponse({
    status: 200,
    description: 'Список модификаторов успешно получен',
    type: [PriceModifierResponseDtoSwagger],
  })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  async findAll() {
    const modifiers = await this.getAllActivePriceModifiersUseCase.execute();
    return modifiers.map(modifier => this.toPriceModifierResponseDto(modifier));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить модификатор цены по ID' })
  @ApiParam({ name: 'id', description: 'ID модификатора цены' })
  @ApiResponse({
    status: 200,
    description: 'Модификатор найден',
    type: PriceModifierResponseDtoSwagger,
  })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  @ApiResponse({ status: 404, description: 'Модификатор не найден' })
  async findOne(@Param('id') id: string) {
    const modifier = await this.getPriceModifierByIdUseCase.execute(parseInt(id));
    return this.toPriceModifierResponseDto(modifier);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить модификатор цены' })
  @ApiParam({ name: 'id', description: 'ID модификатора цены' })
  @ApiBody({ type: UpdatePriceModifierRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Модификатор успешно обновлен',
    type: PriceModifierResponseDtoSwagger,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные запроса' })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiResponse({ status: 404, description: 'Модификатор не найден' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePriceModifierRequestDto,
  ) {
    const modifier = await this.updatePriceModifierUseCase.execute(parseInt(id), dto);
    return this.toPriceModifierResponseDto(modifier);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить модификатор цены' })
  @ApiParam({ name: 'id', description: 'ID модификатора цены' })
  @ApiResponse({ status: 204, description: 'Модификатор успешно удален' })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @ApiResponse({ status: 404, description: 'Модификатор не найден' })
  async remove(@Param('id') id: string) {
    await this.deletePriceModifierUseCase.execute(parseInt(id));
  }

  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Рассчитать цену с учетом модификаторов' })
  @ApiBody({ type: CalculatePriceRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Цена успешно рассчитана',
    type: CalculatePriceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные запроса' })
  @ApiResponse({ status: 401, description: 'Неавторизован' })
  async calculatePrice(@Body() dto: CalculatePriceRequestDto) {
    // Создаем Map для propertyValues как ожидается в сервисе
    const propertyMap = new Map<number, string>();
    if (dto.propertyValues) {
      dto.propertyValues.forEach(pv => propertyMap.set(pv.propertyId, pv.value));
    }
    
    // Используем доменный сервис для расчета цены
    const result = await this.calculatePriceUseCase.execute({
      basePrice: dto.basePrice,
      quantity: dto.quantity,
      unitType: 'unit', // Используем 'unit' по умолчанию, так как в DTO нет unitType
      propertyValues: (dto.propertyValues || []).map(pv => ({
        propertyId: pv.propertyId,
        propertyValue: pv.value,
      })),
      coefficient: dto.coefficient,
      productId: undefined, // В DTO нет productId
    });
    
    return {
      basePrice: result.basePrice,
      finalPrice: result.finalPrice,
      totalPrice: result.finalPrice, // В этом случае finalPrice уже учитывает количество
      appliedModifiers: result.modifiersApplied.map((m: any) => ({
        modifierCode: m.code,
        modifierName: m.name,
        modifierType: m.modifierType,
        value: m.value,
        priceImpact: m.appliedValue,
      })),
      breakdown: {
        basePrice: result.basePrice,
        afterModifiers: result.subtotal,
        afterUnit: result.subtotal * dto.unit, // Используем unit из DTO
        afterCoefficient: (result.subtotal * dto.unit) * result.coefficient,
        afterQuantity: result.finalPrice,
      },
    };
  }

  private toPriceModifierResponseDto(modifier: PriceModifier): PriceModifierResponseDto {
    return {
      id: modifier.getId()!,
      name: modifier.getName(),
      code: modifier.getCode(),
      modifierType: modifier.getModifierType(),
      value: modifier.getValue(),
      propertyId: modifier.getPropertyId() || null,
      propertyValue: modifier.getPropertyValue() || null,
      conditionExpression: modifier.getConditionExpression() || null,
      priority: modifier.getPriority(),
      isActive: modifier.getIsActive(),
      createdAt: modifier.getCreatedAt(),
      updatedAt: modifier.getUpdatedAt(),
    };
  }
}
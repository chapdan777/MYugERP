import { Controller, Get, Post, Put, Param, Body, ParseIntPipe } from '@nestjs/common';
import { CreatePriceModifierRequestDto, UpdatePriceModifierRequestDto, PriceModifierResponseDto } from './dtos/price-modifier.dto';
import { CreatePriceModifierUseCase } from '../application/use-cases/create-price-modifier.use-case';
import { GetPriceModifierByIdUseCase } from '../application/use-cases/get-price-modifier-by-id.use-case';
import { GetAllActivePriceModifiersUseCase } from '../application/use-cases/get-all-active-price-modifiers.use-case';
import { UpdatePriceModifierUseCase } from '../application/use-cases/update-price-modifier.use-case';
import { ActivatePriceModifierUseCase } from '../application/use-cases/activate-price-modifier.use-case';
import { DeactivatePriceModifierUseCase } from '../application/use-cases/deactivate-price-modifier.use-case';
import { PriceModifier } from '../domain/entities/price-modifier.entity';

@Controller('price-modifiers')
export class PriceModifiersController {
  constructor(
    private readonly createPriceModifierUseCase: CreatePriceModifierUseCase,
    private readonly getPriceModifierByIdUseCase: GetPriceModifierByIdUseCase,
    private readonly getAllActivePriceModifiersUseCase: GetAllActivePriceModifiersUseCase,
    private readonly updatePriceModifierUseCase: UpdatePriceModifierUseCase,
    private readonly activatePriceModifierUseCase: ActivatePriceModifierUseCase,
    private readonly deactivatePriceModifierUseCase: DeactivatePriceModifierUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreatePriceModifierRequestDto): Promise<PriceModifierResponseDto> {
    const modifier = await this.createPriceModifierUseCase.execute({
      name: dto.name,
      code: dto.code,
      modifierType: dto.modifierType,
      value: dto.value,
      propertyId: dto.propertyId,
      propertyValue: dto.propertyValue,
      priority: dto.priority,
    });

    return this.mapToResponse(modifier);
  }

  @Get()
  async getAll(): Promise<PriceModifierResponseDto[]> {
    const modifiers = await this.getAllActivePriceModifiersUseCase.execute();
    return modifiers.map(m => this.mapToResponse(m));
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number): Promise<PriceModifierResponseDto> {
    const modifier = await this.getPriceModifierByIdUseCase.execute(id);
    return this.mapToResponse(modifier);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePriceModifierRequestDto,
  ): Promise<PriceModifierResponseDto> {
    const modifier = await this.updatePriceModifierUseCase.execute(id, {
      name: dto.name,
      value: dto.value,
      propertyId: dto.propertyId,
      propertyValue: dto.propertyValue,
      priority: dto.priority,
    });

    return this.mapToResponse(modifier);
  }

  @Post(':id/activate')
  async activate(@Param('id', ParseIntPipe) id: number): Promise<PriceModifierResponseDto> {
    const modifier = await this.activatePriceModifierUseCase.execute(id);
    return this.mapToResponse(modifier);
  }

  @Post(':id/deactivate')
  async deactivate(@Param('id', ParseIntPipe) id: number): Promise<PriceModifierResponseDto> {
    const modifier = await this.deactivatePriceModifierUseCase.execute(id);
    return this.mapToResponse(modifier);
  }

  private mapToResponse(modifier: PriceModifier): PriceModifierResponseDto {
    return {
      id: modifier.getId()!,
      name: modifier.getName(),
      code: modifier.getCode(),
      modifierType: modifier.getModifierType(),
      value: modifier.getValue(),
      propertyId: modifier.getPropertyId(),
      propertyValue: modifier.getPropertyValue(),
      priority: modifier.getPriority(),
      isActive: modifier.getIsActive(),
      createdAt: modifier.getCreatedAt(),
      updatedAt: modifier.getUpdatedAt(),
    };
  }
}

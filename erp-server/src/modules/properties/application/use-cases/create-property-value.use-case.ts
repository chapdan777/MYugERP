import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ModifierType } from '../../../pricing/domain/enums/modifier-type.enum';
import { PriceModifier } from '../../../pricing/domain/entities/price-modifier.entity';
import type { IPriceModifierRepository } from '../../../pricing/domain/repositories/price-modifier.repository.interface';
import { PRICE_MODIFIER_REPOSITORY } from '../../../pricing/domain/repositories/injection-tokens';
import { PROPERTY_VALUE_REPOSITORY, PROPERTY_REPOSITORY } from '../../domain/repositories/injection-tokens';
import type { IPropertyValueRepository } from '../../domain/repositories/property-value.repository.interface';
import { PropertyValue } from '../../domain/entities/property-value.entity';
import type { IPropertyRepository } from '../../domain/repositories/property.repository.interface';

export interface CreatePropertyValueDto {
  propertyId: number;
  value: string;
  priceModifierId?: number | null;
  priceModifierValue?: string;
  displayOrder?: number;
}

@Injectable()
export class CreatePropertyValueUseCase {
  constructor(
    @Inject(PROPERTY_VALUE_REPOSITORY)
    private readonly propertyValueRepository: IPropertyValueRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
    @Inject(PRICE_MODIFIER_REPOSITORY)
    private readonly priceModifierRepository: IPriceModifierRepository,
  ) { }

  async execute(dto: CreatePropertyValueDto): Promise<PropertyValue> {
    // Проверяем, что свойство существует
    const property = await this.propertyRepository.findById(dto.propertyId);
    if (!property) {
      throw new NotFoundException(`Свойство с ID ${dto.propertyId} не найдено`);
    }

    // Проверяем, что значение не дублируется для этого свойства
    const existingValue = await this.propertyValueRepository.findByPropertyIdAndValue(
      dto.propertyId,
      dto.value
    );
    if (existingValue) {
      throw new Error(`Значение '${dto.value}' уже существует для свойства с ID ${dto.propertyId}`);
    }

    let priceModifierId = dto.priceModifierId;

    // Если передан строковый модификатор, создаем или находим его
    if (dto.priceModifierValue) {
      const modifier = await this.getOrCreateModifier(dto.priceModifierValue, dto.propertyId, dto.value);
      priceModifierId = modifier.getId()!;
    }

    const propertyValue = PropertyValue.create({
      propertyId: dto.propertyId,
      value: dto.value,
      priceModifierId: priceModifierId,
      displayOrder: dto.displayOrder ?? 0,
    });

    return await this.propertyValueRepository.save(propertyValue);
  }

  private async getOrCreateModifier(valueStr: string, propertyId: number, propertyValue: string): Promise<PriceModifier> {
    const { type, value, code } = this.parseModifierString(valueStr);

    // Проверяем, существует ли уже модификатор с таким кодом
    const existingModifier = await this.priceModifierRepository.findByCode(code);
    if (existingModifier) {
      return existingModifier;
    }

    const modifier = PriceModifier.create({
      name: `Auto: ${valueStr}`,
      code: code,
      modifierType: type,
      value: value,
      propertyId: propertyId,
      propertyValue: propertyValue,
      priority: 0
    });

    return await this.priceModifierRepository.save(modifier);
  }

  private parseModifierString(input: string): { type: ModifierType, value: number, code: string } {
    const cleanInput = input.trim();

    if (cleanInput.startsWith('*')) {
      const val = parseFloat(cleanInput.substring(1));
      return {
        type: ModifierType.MULTIPLIER,
        value: val,
        code: `AUTO_MULT_${val}`.replace('.', '_')
      };
    }

    if (cleanInput.endsWith('%')) {
      const val = parseFloat(cleanInput.replace('%', ''));
      // Скидка -20% -> val = -20. Надбавка +30% -> val = 30.
      return {
        type: ModifierType.PERCENTAGE,
        value: val,
        code: `AUTO_PERC_${val}`.replace('.', '_').replace('-', 'NEG')
      };
    }

    // По умолчанию фиксированная сумма
    const val = parseFloat(cleanInput.replace('+', ''));
    return {
      type: ModifierType.FIXED_AMOUNT,
      value: val,
      code: `AUTO_FIX_${val}`.replace('.', '_').replace('-', 'NEG')
    };
  }
}
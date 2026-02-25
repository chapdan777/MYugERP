import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PROPERTY_VALUE_REPOSITORY } from '../../domain/repositories/injection-tokens';
import type { IPropertyValueRepository } from '../../domain/repositories/property-value.repository.interface';
import { PropertyValue } from '../../domain/entities/property-value.entity';
import { PRICE_MODIFIER_REPOSITORY } from '../../../pricing/domain/repositories/injection-tokens';
import type { IPriceModifierRepository } from '../../../pricing/domain/repositories/price-modifier.repository.interface';
import { ModifierType } from '../../../pricing/domain/enums/modifier-type.enum';
import { PriceModifier } from '../../../pricing/domain/entities/price-modifier.entity';

export interface UpdatePropertyValueDto {
    value?: string;
    priceModifierId?: number | null;
    priceModifierValue?: string;
    displayOrder?: number;
}

/**
 * UseCase для обновления значения свойства
 */
@Injectable()
export class UpdatePropertyValueUseCase {
    constructor(
        @Inject(PROPERTY_VALUE_REPOSITORY)
        private readonly propertyValueRepository: IPropertyValueRepository,
        @Inject(PRICE_MODIFIER_REPOSITORY)
        private readonly priceModifierRepository: IPriceModifierRepository,
    ) { }

    /**
     * Выполняет обновление значения свойства
     * @param id ID значения свойства
     * @param dto Данные для обновления
     */
    async execute(id: number, dto: UpdatePropertyValueDto): Promise<PropertyValue> {
        const propertyValue = await this.propertyValueRepository.findById(id);

        if (!propertyValue) {
            throw new NotFoundException(`Значение свойства с ID ${id} не найдено`);
        }

        let priceModifierId = dto.priceModifierId;

        if (dto.priceModifierValue) {
            const modifier = await this.getOrCreateModifier(
                dto.priceModifierValue,
                propertyValue.getPropertyId(),
                dto.value ?? propertyValue.getValue()
            );
            priceModifierId = modifier.getId()!;
        }

        propertyValue.updateInfo({
            value: dto.value,
            priceModifierId: priceModifierId,
            displayOrder: dto.displayOrder,
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
            return {
                type: ModifierType.PERCENTAGE,
                value: val,
                code: `AUTO_PERC_${val}`.replace('.', '_').replace('-', 'NEG')
            };
        }

        const val = parseFloat(cleanInput.replace('+', ''));
        return {
            type: ModifierType.FIXED_AMOUNT,
            value: val,
            code: `AUTO_FIX_${val}`.replace('.', '_').replace('-', 'NEG')
        };
    }
}

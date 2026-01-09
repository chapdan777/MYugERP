import { Injectable, Inject } from '@nestjs/common';
import { PRICE_MODIFIER_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { IPriceModifierRepository } from '../../domain/repositories/price-modifier.repository.interface';
import { PriceModifier } from '../../domain/entities/price-modifier.entity';
import { ModifierType } from '../../domain/enums/modifier-type.enum';

export interface CalculatePriceDto {
  basePrice: number;
  quantity: number;
  unitType?: 'm2' | 'linear_meter' | 'unit'; // Тип единицы измерения
  propertyValues: Array<{ propertyId: number; propertyValue: string }>; // Значения свойств
  coefficient?: number; // Дополнительный коэффициент
  productId?: number; // ID продукта для специфических модификаторов
}

export interface CalculatePriceResult {
  basePrice: number;
  modifiersApplied: AppliedModifier[];
  subtotal: number; // Цена до применения коэффициента
  coefficient: number;
  finalPrice: number; // Окончательная цена
  unitType: 'm2' | 'linear_meter' | 'unit';
  quantity: number;
}

interface AppliedModifier {
  modifierId: number;
  name: string;
  code: string;
  modifierType: ModifierType;
  value: number;
  propertyId?: number;
  propertyValue?: string;
  appliedValue: number; // Фактически примененное значение к цене
}

@Injectable()
export class CalculatePriceUseCase {
  constructor(
    @Inject(PRICE_MODIFIER_REPOSITORY)
    private readonly modifierRepository: IPriceModifierRepository,
  ) {}

  async execute(dto: CalculatePriceDto): Promise<CalculatePriceResult> {
    // Получаем все активные модификаторы
    const allModifiers = await this.modifierRepository.findAllActive();
    
    // Преобразуем propertyValues в Map для удобства проверки применимости
    const propertyMap = new Map<number, string>();
    dto.propertyValues.forEach(pv => propertyMap.set(pv.propertyId, pv.propertyValue));

    // Фильтруем применимые модификаторы
    let applicableModifiers = allModifiers.filter(modifier => 
      modifier.isApplicableFor(propertyMap)
    );

    // Если указан productId, можем дополнительно фильтровать модификаторы
    if (dto.productId) {
      // В будущем можно добавить специфические фильтры по продукту
      // Пока просто оставляем все применимые
    }

    // Сортируем модификаторы по приоритету
    applicableModifiers.sort((a, b) => a.getPriority() - b.getPriority());

    // Применяем модификаторы к базовой цене
    let subtotal = dto.basePrice;
    const appliedModifiers: AppliedModifier[] = [];

    for (const modifier of applicableModifiers) {
      const appliedValue = this.applyModifier(subtotal, modifier, dto);
      subtotal += appliedValue;

      appliedModifiers.push({
        modifierId: modifier.getId()!,
        name: modifier.getName(),
        code: modifier.getCode(),
        modifierType: modifier.getModifierType(),
        value: modifier.getValue(),
        propertyId: modifier.getPropertyId() || undefined,
        propertyValue: modifier.getPropertyValue() || undefined,
        appliedValue,
      });
    }

    // Применяем коэффициент
    const coefficient = dto.coefficient || 1;
    const finalPrice = subtotal * coefficient * dto.quantity;

    return {
      basePrice: dto.basePrice,
      modifiersApplied: appliedModifiers,
      subtotal,
      coefficient,
      finalPrice,
      unitType: dto.unitType || 'unit',
      quantity: dto.quantity,
    };
  }

  private applyModifier(basePrice: number, modifier: PriceModifier, dto: CalculatePriceDto): number {
    const modifierValue = modifier.getValue();
    
    switch (modifier.getModifierType()) {
      case ModifierType.PERCENTAGE:
        // Процент от базовой цены
        return basePrice * (modifierValue / 100);
        
      case ModifierType.FIXED_PRICE:
        // Заменяет базовую цену полностью
        return modifierValue - basePrice;
        
      case ModifierType.PER_UNIT:
        // Фиксированная сумма за единицу измерения
        // Учитываем тип единицы измерения и количество
        const unitFactor = this.getUnitFactor(dto);
        return modifierValue * unitFactor;
        
      case ModifierType.MULTIPLIER:
        // Множитель к базовой цене
        return basePrice * (modifierValue - 1); // вычитаем 1, чтобы получить разницу
        
      case ModifierType.FIXED_AMOUNT:
        // Фиксированная сумма добавляется/вычитается
        return modifierValue;
        
      default:
        throw new Error(`Неизвестный тип модификатора: ${modifier.getModifierType()}`);
    }
  }

  private getUnitFactor(dto: CalculatePriceDto): number {
    switch (dto.unitType) {
      case 'm2':
        // Площадь = длина * ширина * количество
        // В данном случае мы просто используем количество
        return dto.quantity;
      case 'linear_meter':
        // Погонные метры = длина * количество
        // В данном случае мы просто используем количество
        return dto.quantity;
      case 'unit':
      default:
        return dto.quantity;
    }
  }
}
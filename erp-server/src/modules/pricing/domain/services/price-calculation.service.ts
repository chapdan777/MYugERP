import { Injectable, Inject } from '@nestjs/common';
import { PRICE_MODIFIER_REPOSITORY } from '../repositories/injection-tokens';
import { IPriceModifierRepository } from '../repositories/price-modifier.repository.interface';
import { PriceModifier } from '../entities/price-modifier.entity';
import { ModifierType } from '../enums/modifier-type.enum';
import {
  PriceCalculationContext,
  PriceCalculationResult,
  AppliedModifier,
  PriceBreakdown,
} from './price-calculation.types';
import { DomainException } from '../../../../common/exceptions/domain.exception';

/**
 * PriceCalculationService - доменный сервис для расчета цен
 * Применяет модификаторы к базовой цене в правильном порядке
 * 
 * Алгоритм расчета:
 * 1. Получить все активные модификаторы
 * 2. Отфильтровать применимые для текущих свойств
 * 3. Отсортировать по приоритету
 * 4. Применить модификаторы последовательно
 * 5. Умножить на единицы измерения
 * 6. Применить коэффициент
 * 7. Умножить на количество
 */
@Injectable()
export class PriceCalculationService {
  constructor(
    @Inject(PRICE_MODIFIER_REPOSITORY)
    private readonly modifierRepository: IPriceModifierRepository,
  ) {}

  /**
   * Основной метод расчета цены
   */
  async calculatePrice(context: PriceCalculationContext): Promise<PriceCalculationResult> {
    this.validateContext(context);

    // Получить все активные модификаторы
    const allModifiers = await this.modifierRepository.findAllActive();

    // Отфильтровать применимые модификаторы
    const applicableModifiers = allModifiers.filter(modifier =>
      modifier.isApplicableFor(context.propertyValues),
    );

    // Отсортировать по приоритету (меньше = раньше)
    const sortedModifiers = this.sortByPriority(applicableModifiers);

    // Применить модификаторы последовательно
    let currentPrice = context.basePrice;
    const appliedModifiers: AppliedModifier[] = [];
    const breakdown: PriceBreakdown = {
      basePrice: context.basePrice,
      afterModifiers: 0,
      afterUnit: 0,
      afterCoefficient: 0,
      afterQuantity: 0,
    };

    for (const modifier of sortedModifiers) {
      const priceBeforeModifier = currentPrice;
      currentPrice = this.applyModifier(currentPrice, modifier, context.unit);
      const priceImpact = currentPrice - priceBeforeModifier;

      appliedModifiers.push({
        modifierCode: modifier.getCode(),
        modifierName: modifier.getName(),
        modifierType: modifier.getModifierType(),
        value: modifier.getValue(),
        priceImpact,
      });
    }

    breakdown.afterModifiers = currentPrice;

    // Умножить на единицы измерения (если модификатор не PER_UNIT)
    const hasPerUnitModifier = sortedModifiers.some(
      m => m.getModifierType() === ModifierType.PER_UNIT,
    );
    if (!hasPerUnitModifier) {
      currentPrice = currentPrice * context.unit;
    }
    breakdown.afterUnit = currentPrice;

    // Применить коэффициент
    currentPrice = currentPrice * context.coefficient;
    breakdown.afterCoefficient = currentPrice;

    // Умножить на количество
    const totalPrice = currentPrice * context.quantity;
    breakdown.afterQuantity = totalPrice;

    return {
      basePrice: context.basePrice,
      finalPrice: currentPrice,
      totalPrice,
      appliedModifiers,
      breakdown,
    };
  }

  /**
   * Валидация входного контекста
   */
  private validateContext(context: PriceCalculationContext): void {
    if (context.basePrice < 0) {
      throw new DomainException('Базовая цена не может быть отрицательной');
    }

    if (context.quantity <= 0) {
      throw new DomainException('Количество должно быть положительным');
    }

    if (context.unit <= 0) {
      throw new DomainException('Единицы измерения должны быть положительными');
    }

    if (context.coefficient <= 0) {
      throw new DomainException('Коэффициент должен быть положительным');
    }
  }

  /**
   * Сортировка модификаторов по приоритету
   */
  private sortByPriority(modifiers: PriceModifier[]): PriceModifier[] {
    return [...modifiers].sort((a, b) => a.getPriority() - b.getPriority());
  }

  /**
   * Применение одного модификатора к цене
   */
  private applyModifier(
    currentPrice: number,
    modifier: PriceModifier,
    unit: number,
  ): number {
    switch (modifier.getModifierType()) {
      case ModifierType.FIXED_PRICE:
        // Фиксированная цена полностью заменяет текущую
        return modifier.getValue();

      case ModifierType.PERCENTAGE:
        // Процентная надбавка/скидка
        return currentPrice * (1 + modifier.getValue() / 100);

      case ModifierType.FIXED_AMOUNT:
        // Фиксированная сумма надбавки/скидки
        return currentPrice + modifier.getValue();

      case ModifierType.PER_UNIT:
        // Цена за единицу измерения
        return modifier.getValue() * unit;

      case ModifierType.MULTIPLIER:
        // Множитель цены
        return currentPrice * modifier.getValue();

      default:
        throw new DomainException(`Неизвестный тип модификатора: ${modifier.getModifierType()}`);
    }
  }

  /**
   * Расчет цены без сохраненных модификаторов (для тестирования)
   */
  calculatePriceWithModifiers(
    basePrice: number,
    modifiers: PriceModifier[],
    quantity: number,
    unit: number,
    coefficient: number,
  ): number {
    const sortedModifiers = this.sortByPriority(modifiers);
    let currentPrice = basePrice;

    for (const modifier of sortedModifiers) {
      currentPrice = this.applyModifier(currentPrice, modifier, unit);
    }

    const hasPerUnitModifier = sortedModifiers.some(
      m => m.getModifierType() === ModifierType.PER_UNIT,
    );

    if (!hasPerUnitModifier) {
      currentPrice = currentPrice * unit;
    }

    currentPrice = currentPrice * coefficient;
    return currentPrice * quantity;
  }
}

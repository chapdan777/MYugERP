import { Injectable, Inject } from '@nestjs/common';
import { PriceModifier } from '../entities/price-modifier.entity';
import { ModifierType } from '../enums/modifier-type.enum';
import { IPriceModifierRepository } from '../repositories/price-modifier.repository.interface';
import { PRICE_MODIFIER_REPOSITORY } from '../repositories/injection-tokens';
import { PRODUCT_REPOSITORY, PRODUCT_PROPERTY_REPOSITORY } from '../../../products/domain/repositories/injection-tokens';
import { IProductRepository } from '../../../products/domain/repositories/product.repository.interface';
import { IProductPropertyRepository } from '../../../products/domain/repositories/product-property.repository.interface';
import { ProductProperty as DbProductProperty } from '../../../products/domain/entities/product-property.entity';

// Интерфейсы для внешних сервисов (будут реализованы при интеграции)
export interface Product {
  id: number;
  name: string;
  basePrice: number;
  unit: 'm2' | 'linear_meter' | 'unit';
  defaultLength: number;
  defaultWidth: number;
  defaultDepth: number;
  properties: ProductProperty[];
}

export interface ProductProperty {
  propertyId: number;
  propertyName: string;
  isActive: boolean;
  defaultValue: string;
  currentValue?: string; // Значение установленное пользователем
}

export interface CalculationContext {
  productId: number;
  quantity: number;
  length?: number;
  width?: number;
  depth?: number;
  userSelectedProperties: Array<{ propertyId: number; value: string }>;
  coefficient?: number;
}

export interface PriceCalculationResult {
  basePrice: number;          // Базовая цена номенклатуры
  unitPrice: number;          // Цена за 1 м²/п.м./шт после применения всех модификаторов (аддитивных и мультипликативных)
  modifiedUnitPrice: number;  // Итоговая цена с учетом размеров/геометрии (площадь, длина и т.д.)
  quantity: number;
  unitType: 'm2' | 'linear_meter' | 'unit';
  dimensions: {
    length: number;
    width: number;
    depth: number;
  };
  coefficient: number;
  modifiersApplied: AppliedModifier[];
  subtotal: number;
  finalPrice: number;
}

interface AppliedModifier {
  modifierId: number;
  name: string;
  code: string;
  modifierType: ModifierType;
  value: number;
  propertyId?: number;
  propertyValue?: string;
  appliedValue: number;
}

@Injectable()
export class ProductPriceCalculatorService {
  constructor(
    @Inject(PRICE_MODIFIER_REPOSITORY)
    private readonly modifierRepository: IPriceModifierRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(PRODUCT_PROPERTY_REPOSITORY)
    private readonly productPropertyRepository: IProductPropertyRepository,
  ) { }

  /**
   * Основной метод расчета цены с учетом продукта и его свойств
   */
  async calculatePrice(context: CalculationContext): Promise<PriceCalculationResult> {
    // 1. Получить продукт (в реальной реализации через Product модуль)
    const product = await this.getProductById(context.productId);

    // 2. Рассчитать единицы измерения
    const dimensions = this.calculateDimensions(product, context);
    const unitMeasurement = this.calculateUnitMeasurement(product, dimensions);

    // 3. Получить базовую цену
    const basePrice = product.basePrice;

    // 4. Получить активные свойства (дефолтные + выбранные пользователем)
    const activeProperties = this.getActiveProperties(product, context.userSelectedProperties);

    // 5. Найти применимые модификаторы
    const applicableModifiers = await this.getApplicableModifiers(activeProperties);

    // 6. Разделить модификаторы на аддитивные и мультипликативные
    const additiveModifiers = applicableModifiers.filter(
      m => m.getModifierType() === ModifierType.FIXED_AMOUNT || m.getModifierType() === ModifierType.PERCENTAGE
    );
    const multiplicativeModifiers = applicableModifiers.filter(
      m => m.getModifierType() === ModifierType.MULTIPLIER
    );

    // 7. Применить аддитивные модификаторы к БАЗОВОЙ цене
    let priceAfterAdditive = basePrice;
    const appliedModifiers: AppliedModifier[] = [];

    for (const modifier of additiveModifiers) {
      const appliedValue = this.applyAdditiveModifier(priceAfterAdditive, modifier);
      priceAfterAdditive += appliedValue;

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

    // 8. Применить мультипликативные модификаторы к цене после аддитивных
    let priceAfterMultiplicative = priceAfterAdditive;
    for (const modifier of multiplicativeModifiers) {
      const factor = this.getMultiplicativeFactor(modifier);
      const oldValue = priceAfterMultiplicative;
      priceAfterMultiplicative *= factor;

      appliedModifiers.push({
        modifierId: modifier.getId()!,
        name: modifier.getName(),
        code: modifier.getCode(),
        modifierType: modifier.getModifierType(),
        value: modifier.getValue(),
        propertyId: modifier.getPropertyId() || undefined,
        propertyValue: modifier.getPropertyValue() || undefined,
        appliedValue: priceAfterMultiplicative - oldValue,
      });
    }

    // 9. Цена за 1 м²/п.м./шт после всех модификаторов (новое поле unitPrice)
    const unitPrice = priceAfterMultiplicative;

    // 10. Применить площадь/единицы измерения (новое поле modifiedUnitPrice)
    const modifiedUnitPrice = unitPrice * unitMeasurement;

    // 11. Применить коэффициент
    const coefficient = context.coefficient || 1;
    const priceWithCoefficient = modifiedUnitPrice * coefficient;

    // 12. Применить количество
    const finalPrice = priceWithCoefficient * context.quantity;

    return {
      basePrice,                           // Базовая цена номенклатуры (1500)
      unitPrice,                           // Цена за 1 м²/п.м./шт после модификаторов (3900)
      modifiedUnitPrice,                   // Итоговая цена с учетом размеров (6240)
      quantity: context.quantity,
      unitType: product.unit,
      dimensions,
      coefficient,
      modifiersApplied: appliedModifiers,
      subtotal: modifiedUnitPrice,         // Промежуточный итог (цена с размерами)
      finalPrice,                          // Итоговая стоимость (74880)
    };
  }

  /**
   * Получить продукт по ID (заглушка - будет заменена на реальный вызов)
   */
  private async getProductById(productId: number): Promise<Product> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new Error(`Продукт с ID ${productId} не найден`);
    }

    const properties = await this.productPropertyRepository.findByProductId(productId);

    return {
      id: product.getId()!,
      name: product.getName(),
      basePrice: product.getBasePrice(),
      unit: product.getUnit().getValue() as any,
      defaultLength: product.getDefaultLength() || 0,
      defaultWidth: product.getDefaultWidth() || 0,
      defaultDepth: product.getDefaultDepth() || 0,
      properties: properties.map((prop: DbProductProperty) => ({
        propertyId: prop.getPropertyId(),
        propertyName: `Property ${prop.getPropertyId()}`,
        isActive: prop.getIsActive(),
        defaultValue: prop.getDefaultValue() || '',
      })),
    };
  }

  /**
   * Рассчитать фактические размеры
   */
  private calculateDimensions(product: Product, context: CalculationContext) {
    return {
      length: context.length || product.defaultLength,
      width: context.width || product.defaultWidth,
      depth: context.depth || product.defaultDepth,
    };
  }

  /**
   * Рассчитать единицы измерения в зависимости от типа продукта
   */
  private calculateUnitMeasurement(product: Product, dimensions: { length: number; width: number; depth: number }): number {
    switch (product.unit) {
      case 'm2':
        // Площадь = (длина * ширина) / 1000000 (перевод из мм² в м²)
        return (dimensions.length * dimensions.width) / 1000000;

      case 'linear_meter':
        // Погонные метры = длина / 1000 (перевод из мм в м)
        return dimensions.length / 1000;

      case 'unit':
      default:
        // Штуки = 1
        return 1;
    }
  }

  /**
   * Получить активные свойства (дефолтные + выбранные пользователем)
   */
  private getActiveProperties(product: Product, userSelectedProperties: Array<{ propertyId: number; value: string }>): ProductProperty[] {
    // 1. Берем все АКТИВНЫЕ дефолтные свойства продукта
    const activeProductProps = product.properties.filter(prop => prop.isActive);

    const resultMap = new Map<number, ProductProperty>();

    // Заполняем мапу дефолтными активными свойствами
    activeProductProps.forEach(prop => {
      resultMap.set(prop.propertyId, { ...prop });
    });

    // 2. Накатываем сверху пользовательские свойства (переопределяют дефолтные или добавляют новые, включая активацию скрытых)
    if (userSelectedProperties && userSelectedProperties.length > 0) {
      userSelectedProperties.forEach(userProp => {
        resultMap.set(userProp.propertyId, {
          propertyId: userProp.propertyId,
          propertyName: `Property ${userProp.propertyId}`,
          isActive: true, // Пользовательские свойства всегда активны
          defaultValue: userProp.value,
          currentValue: userProp.value,
        });
      });
    }

    return Array.from(resultMap.values());
  }

  /**
   * Получить применимые модификаторы для активных свойств
   * Использует реальные модификаторы из базы данных
   */
  private async getApplicableModifiers(activeProperties: ProductProperty[]): Promise<PriceModifier[]> {
    // Получить все активные модификаторы из БД
    const allModifiers = await this.modifierRepository.findAllActive();

    // Создать Map со значениями свойств для проверки применимости
    const propertyValuesMap = new Map<number, string>();
    activeProperties.forEach(prop => {
      const effectiveValue = prop.currentValue || prop.defaultValue;
      propertyValuesMap.set(prop.propertyId, effectiveValue);
    });

    // Отфильтровать только применимые модификаторы
    const applicableModifiers = allModifiers.filter(modifier => {
      return modifier.isApplicableFor(propertyValuesMap);
    });

    // Отсортировать по приоритету (меньше = раньше)
    return applicableModifiers.sort((a, b) => a.getPriority() - b.getPriority());
  }



  /**
   * Получить множитель для мультипликативного модификатора
   */
  private getMultiplicativeFactor(modifier: PriceModifier): number {
    switch (modifier.getModifierType()) {
      case ModifierType.MULTIPLIER:
        return modifier.getValue();
      case ModifierType.PERCENTAGE:
        // Процентные модификаторы тоже могут быть мультипликативными
        // Например: +10% = *1.1, -20% = *0.8
        return 1 + modifier.getValue() / 100;
      default:
        return 1;
    }
  }

  /**
   * Применить аддитивный модификатор к цене
   */
  private applyAdditiveModifier(currentPrice: number, modifier: PriceModifier): number {
    const modifierValue = modifier.getValue();

    switch (modifier.getModifierType()) {
      case ModifierType.PERCENTAGE:
        return currentPrice * (modifierValue / 100);

      case ModifierType.FIXED_PRICE:
        return modifierValue - currentPrice;

      case ModifierType.PER_UNIT:
        // Для PER_UNIT нужно знать единицы измерения, 
        // пока используем 1 как заглушку
        return modifierValue * 1;

      case ModifierType.FIXED_AMOUNT:
        return modifierValue;

      default:
        throw new Error(`Неверный тип аддитивного модификатора: ${modifier.getModifierType()}`);
    }
  }

}
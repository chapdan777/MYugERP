import { Injectable } from '@nestjs/common';
import { PriceModifier } from '../entities/price-modifier.entity';
import { ModifierType } from '../enums/modifier-type.enum';

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
    // TODO: Заменить на реальный вызов Product модуля
    return {
      id: productId,
      name: 'Фасад с филенкой',
      basePrice: 1500,
      unit: 'm2',
      defaultLength: 2.0,
      defaultWidth: 0.8,
      defaultDepth: 0.018,
      properties: [
        {
          propertyId: 1,
          propertyName: 'Модель фасада',
          isActive: true,
          defaultValue: 'Вероника',
        },
        {
          propertyId: 2,
          propertyName: 'Филенка',
          isActive: true,
          defaultValue: 'Стандарт с рубашкой 1,5мм',
        },
        {
          propertyId: 3,
          propertyName: 'Материал филенки',
          isActive: true,
          defaultValue: 'Массив',
        },
        {
          propertyId: 4,
          propertyName: 'Приклейка декора',
          isActive: false, // Отключено по умолчанию
          defaultValue: 'Да',
        },
      ],
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
        // Площадь = длина × ширина
        return dimensions.length * dimensions.width;
        
      case 'linear_meter':
        // Погонные метры = длина
        return dimensions.length;
        
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
    // Начинаем с дефолтных активных свойств
    const activeProperties = product.properties.filter(prop => prop.isActive);
    
    // Добавляем свойства, включенные пользователем
    userSelectedProperties.forEach(userProp => {
      const existingProp = activeProperties.find(p => p.propertyId === userProp.propertyId);
      if (existingProp) {
        // Обновляем значение
        existingProp.currentValue = userProp.value;
      } else {
        // Добавляем новое активное свойство
        const productProp = product.properties.find(p => p.propertyId === userProp.propertyId);
        if (productProp) {
          activeProperties.push({
            ...productProp,
            currentValue: userProp.value,
          });
        }
      }
    });
    
    return activeProperties;
  }

  /**
   * Получить применимые модификаторы для активных свойств
   */
  private async getApplicableModifiers(activeProperties: ProductProperty[]): Promise<PriceModifier[]> {
    // TODO: Заменить на реальный вызов репозитория модификаторов
    // Пока возвращаем заглушку с примерами
    
    const modifiers: PriceModifier[] = [];
    
    // Примеры модификаторов из ТЗ
    activeProperties.forEach(prop => {
      switch (prop.propertyName) {
        case 'Модель фасада':
          if (prop.currentValue || prop.defaultValue === 'Вероника') {
            // Модель фасада="Вероника": +1000р
            modifiers.push(this.createMockModifier({
              name: 'Модель Вероника',
              code: 'MODEL_VERONICA',
              modifierType: ModifierType.FIXED_AMOUNT,
              value: 1000,
              propertyId: prop.propertyId,
              propertyValue: prop.currentValue || prop.defaultValue,
            }));
          }
          break;
          
        case 'Филенка':
          if (prop.currentValue || prop.defaultValue === 'Стандарт с рубашкой 1,5мм') {
            // Филенка="Стандарт с рубашкой 1,5мм": +500р
            modifiers.push(this.createMockModifier({
              name: 'Филенка стандарт',
              code: 'FRAME_STANDARD',
              modifierType: ModifierType.FIXED_AMOUNT,
              value: 500,
              propertyId: prop.propertyId,
              propertyValue: prop.currentValue || prop.defaultValue,
            }));
          }
          break;
          
        case 'Материал филенки':
          const materialValue = prop.currentValue || prop.defaultValue;
          if (materialValue === 'Массив') {
            // Материал филенки="Массив": *1.3
            modifiers.push(this.createMockModifier({
              name: 'Материал массив',
              code: 'MATERIAL_ARRAY',
              modifierType: ModifierType.MULTIPLIER,
              value: 1.3,
              propertyId: prop.propertyId,
              propertyValue: prop.currentValue || prop.defaultValue,
            }));
          }
          break;
          
        case 'Приклейка декора':
          if ((prop.currentValue || prop.defaultValue) === 'Да') {
            // Приклейка декора: *1.3
            modifiers.push(this.createMockModifier({
              name: 'Приклейка декора',
              code: 'DECOR_ATTACHMENT',
              modifierType: ModifierType.MULTIPLIER,
              value: 1.3,
              propertyId: prop.propertyId,
              propertyValue: 'Да',
            }));
          }
          break;
      }
    });
    
    return modifiers;
  }

  /**
   * Создать заглушку модификатора (временно)
   */
  private createMockModifier(props: any): PriceModifier {
    return PriceModifier.create({
      name: props.name,
      code: props.code,
      modifierType: props.modifierType,
      value: props.value,
      propertyId: props.propertyId,
      propertyValue: props.propertyValue,
      priority: 0,
    });
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
/**
 * PriceCalculationContext - входные данные для расчета цены
 */
export interface PriceCalculationContext {
  basePrice: number;                      // Базовая цена продукта
  quantity: number;                       // Количество единиц
  unit: number;                          // Единицы измерения (м², м, шт)
  coefficient: number;                    // Дополнительный коэффициент
  propertyValues: Map<number, string>;   // Значения свойств для определения применимых модификаторов
}

/**
 * PriceCalculationResult - результат расчета цены
 */
export interface PriceCalculationResult {
  basePrice: number;                      // Исходная базовая цена
  finalPrice: number;                     // Итоговая цена после всех модификаторов
  totalPrice: number;                     // Итоговая цена × количество
  appliedModifiers: AppliedModifier[];    // Список примененных модификаторов
  breakdown: PriceBreakdown;              // Детализация расчета
}

/**
 * AppliedModifier - информация о примененном модификаторе
 */
export interface AppliedModifier {
  modifierCode: string;
  modifierName: string;
  modifierType: string;
  value: number;
  priceImpact: number;                    // Изменение цены (может быть отрицательным)
}

/**
 * PriceBreakdown - детализация расчета цены
 */
export interface PriceBreakdown {
  basePrice: number;
  afterModifiers: number;
  afterUnit: number;
  afterCoefficient: number;
  afterQuantity: number;
}

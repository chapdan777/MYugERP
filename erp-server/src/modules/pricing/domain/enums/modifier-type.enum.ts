/**
 * ModifierType - типы модификаторов цены
 */
export enum ModifierType {
  FIXED_PRICE = 'fixed_price',           // Фиксированная цена (перезаписывает базовую)
  PERCENTAGE = 'percentage',             // Процентная надбавка/скидка от базовой цены
  FIXED_AMOUNT = 'fixed_amount',         // Фиксированная сумма надбавки/скидки
  PER_UNIT = 'per_unit',                 // Цена за единицу измерения (м², м, шт и т.д.)
  MULTIPLIER = 'multiplier',             // Множитель базовой цены
}

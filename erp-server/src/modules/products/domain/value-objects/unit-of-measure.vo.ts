/**
 * Value Object для единицы измерения
 */
export class UnitOfMeasure {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): UnitOfMeasure {
    const normalized = value.trim().toLowerCase();
    
    if (!normalized) {
      throw new Error('Единица измерения не может быть пустой');
    }

    // Список допустимых единиц измерения
    const validUnits = [
      'шт',     // штуки
      'м',      // метры
      'м2',     // квадратные метры
      'м3',     // кубические метры
      'кг',     // килограммы
      'л',      // литры
      'компл',  // комплект
      'упак',   // упаковка
      'п.м',    // погонные метры
    ];

    if (!validUnits.includes(normalized)) {
      throw new Error(
        `Недопустимая единица измерения: ${value}. Допустимые значения: ${validUnits.join(', ')}`,
      );
    }

    return new UnitOfMeasure(normalized);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: UnitOfMeasure): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

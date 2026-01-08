import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ModifierType } from '../enums/modifier-type.enum';

/**
 * PriceModifier - агрегат для управления модификаторами цен
 * Модификаторы применяются к базовой цене продукта в зависимости от свойств заказа
 */
export class PriceModifier {
  private id?: number;
  private name: string;
  private code: string;
  private modifierType: ModifierType;
  private value: number; // Значение модификатора (процент, сумма, множитель и т.д.)
  private propertyId: number | null; // Свойство, с которым связан модификатор
  private propertyValue: string | null; // Значение свойства, при котором применяется модификатор
  private priority: number; // Порядок применения модификаторов (меньше = раньше)
  private isActive: boolean;
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(props: {
    id?: number;
    name: string;
    code: string;
    modifierType: ModifierType;
    value: number;
    propertyId?: number | null;
    propertyValue?: string | null;
    priority?: number;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.code = props.code;
    this.modifierType = props.modifierType;
    this.value = props.value;
    this.propertyId = props.propertyId ?? null;
    this.propertyValue = props.propertyValue ?? null;
    this.priority = props.priority ?? 0;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();

    this.validate();
  }

  /**
   * Фабричный метод для создания нового модификатора
   */
  static create(props: {
    name: string;
    code: string;
    modifierType: ModifierType;
    value: number;
    propertyId?: number | null;
    propertyValue?: string | null;
    priority?: number;
  }): PriceModifier {
    return new PriceModifier(props);
  }

  /**
   * Фабричный метод для восстановления из БД
   */
  static restore(props: {
    id: number;
    name: string;
    code: string;
    modifierType: ModifierType;
    value: number;
    propertyId: number | null;
    propertyValue: string | null;
    priority: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): PriceModifier {
    return new PriceModifier(props);
  }

  /**
   * Валидация инвариантов
   */
  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new DomainException('Название модификатора не может быть пустым');
    }

    if (!this.code || this.code.trim().length === 0) {
      throw new DomainException('Код модификатора не может быть пустым');
    }

    if (this.priority < 0) {
      throw new DomainException('Приоритет не может быть отрицательным');
    }

    // Валидация значения в зависимости от типа
    switch (this.modifierType) {
      case ModifierType.PERCENTAGE:
        // Процент может быть отрицательным (скидка) или положительным (надбавка)
        if (this.value < -100) {
          throw new DomainException('Процентная скидка не может быть больше 100%');
        }
        break;

      case ModifierType.FIXED_PRICE:
      case ModifierType.PER_UNIT:
        if (this.value < 0) {
          throw new DomainException('Цена не может быть отрицательной');
        }
        break;

      case ModifierType.MULTIPLIER:
        if (this.value < 0) {
          throw new DomainException('Множитель не может быть отрицательным');
        }
        break;

      case ModifierType.FIXED_AMOUNT:
        // Фиксированная сумма может быть отрицательной (скидка)
        break;
    }

    // Если указано свойство, должно быть указано и значение свойства
    if (this.propertyId && !this.propertyValue) {
      throw new DomainException(
        'Если указано свойство, необходимо указать значение свойства',
      );
    }
  }

  /**
   * Проверка, применим ли модификатор для данного набора свойств
   */
  isApplicableFor(propertyValues: Map<number, string>): boolean {
    // Если модификатор не привязан к свойству, он применим всегда
    if (!this.propertyId) {
      return true;
    }

    // Проверяем, соответствует ли значение свойства
    const actualValue = propertyValues.get(this.propertyId);
    return actualValue === this.propertyValue;
  }

  /**
   * Обновление информации о модификаторе
   */
  updateInfo(props: {
    name?: string;
    value?: number;
    propertyId?: number | null;
    propertyValue?: string | null;
    priority?: number;
  }): void {
    if (props.name !== undefined) {
      this.name = props.name;
    }

    if (props.value !== undefined) {
      this.value = props.value;
    }

    if (props.propertyId !== undefined) {
      this.propertyId = props.propertyId;
    }

    if (props.propertyValue !== undefined) {
      this.propertyValue = props.propertyValue;
    }

    if (props.priority !== undefined) {
      if (props.priority < 0) {
        throw new DomainException('Приоритет не может быть отрицательным');
      }
      this.priority = props.priority;
    }

    this.updatedAt = new Date();
    this.validate();
  }

  /**
   * Активация модификатора
   */
  activate(): void {
    if (this.isActive) {
      throw new DomainException('Модификатор уже активен');
    }
    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Деактивация модификатора
   */
  deactivate(): void {
    if (!this.isActive) {
      throw new DomainException('Модификатор уже деактивирован');
    }
    this.isActive = false;
    this.updatedAt = new Date();
  }

  // Getters
  getId(): number | undefined {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getCode(): string {
    return this.code;
  }

  getModifierType(): ModifierType {
    return this.modifierType;
  }

  getValue(): number {
    return this.value;
  }

  getPropertyId(): number | null {
    return this.propertyId;
  }

  getPropertyValue(): string | null {
    return this.propertyValue;
  }

  getPriority(): number {
    return this.priority;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}

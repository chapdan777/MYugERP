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
  private conditionExpression: string | null; // Сложное условие фильтрации (альтернатива propertyId/propertyValue)
  private priority: number; // Порядок применения модификаторов (меньше = раньше)
  private isActive: boolean;
  private startDate: Date | null; // Дата начала действия (для временных модификаторов)
  private endDate: Date | null;   // Дата окончания действия (для временных модификаторов)
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
    conditionExpression?: string | null;
    priority?: number;
    isActive?: boolean;
    startDate?: Date | null;
    endDate?: Date | null;
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
    this.conditionExpression = props.conditionExpression ?? null;
    this.priority = props.priority ?? 0;
    this.isActive = props.isActive ?? true;
    this.startDate = props.startDate ?? null;
    this.endDate = props.endDate ?? null;
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
    conditionExpression?: string | null;
    priority?: number;
    startDate?: Date | null;
    endDate?: Date | null;
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
    conditionExpression: string | null;
    priority: number;
    isActive: boolean;
    startDate: Date | null;
    endDate: Date | null;
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

    // Взаимоисключающие системы условий
    const hasLegacyConditions = this.propertyId !== null || this.propertyValue !== null;
    const hasComplexConditions = this.conditionExpression !== null;
    
    if (hasLegacyConditions && hasComplexConditions) {
      throw new DomainException(
        'Нельзя одновременно использовать старую систему условий (propertyId/propertyValue) и новую (conditionExpression)',
      );
    }

    // Если используется новая система, expression не может быть пустым
    if (hasComplexConditions && this.conditionExpression!.trim().length === 0) {
      throw new DomainException('Выражение условия не может быть пустым');
    }

    // Валидация временных ограничений
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      throw new DomainException('Дата начала не может быть позже даты окончания');
    }

    // Если указан только startDate, он должен быть в будущем (для новых модификаторов)
    if (this.startDate && !this.id && this.startDate < new Date()) {
      // Предупреждение: можно создавать модификаторы с прошедшей датой начала
      // Это может быть полезно для исторических данных
    }
  }

  /**
   * Проверка, применим ли модификатор для данного набора свойств
   */
  isApplicableFor(propertyValues: Map<number, string>, currentDate: Date = new Date()): boolean {
    // Если модификатор не привязан к свойству, он применим всегда
    if (!this.propertyId) {
      return true;
    }

    // Проверяем, соответствует ли значение свойства
    const actualValue = propertyValues.get(this.propertyId);
    if (actualValue !== this.propertyValue) {
      return false;
    }

    // Проверяем временные ограничения
    return this.isCurrentlyActive(currentDate);
  }

  /**
   * Проверка, активен ли модификатор на текущую дату
   */
  isCurrentlyActive(currentDate: Date = new Date()): boolean {
    // Если не активен вообще, то точно не применим
    if (!this.isActive) {
      return false;
    }

    // Если нет временных ограничений, то применим
    if (!this.startDate && !this.endDate) {
      return true;
    }

    // Проверяем начало действия
    if (this.startDate && currentDate < this.startDate) {
      return false;
    }

    // Проверяем окончание действия
    if (this.endDate && currentDate > this.endDate) {
      return false;
    }

    return true;
  }

  /**
   * Обновление информации о модификаторе
   */
  updateInfo(props: {
    name?: string;
    value?: number;
    propertyId?: number | null;
    propertyValue?: string | null;
    conditionExpression?: string | null;
    priority?: number;
    startDate?: Date | null;
    endDate?: Date | null;
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

    if (props.conditionExpression !== undefined) {
      this.conditionExpression = props.conditionExpression;
    }

    if (props.priority !== undefined) {
      if (props.priority < 0) {
        throw new DomainException('Приоритет не может быть отрицательным');
      }
      this.priority = props.priority;
    }

    if (props.startDate !== undefined) {
      this.startDate = props.startDate;
    }

    if (props.endDate !== undefined) {
      this.endDate = props.endDate;
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

  getConditionExpression(): string | null {
    return this.conditionExpression;
  }

  getPriority(): number {
    return this.priority;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  getStartDate(): Date | null {
    return this.startDate;
  }

  getEndDate(): Date | null {
    return this.endDate;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}

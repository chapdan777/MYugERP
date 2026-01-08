import { DomainException } from '../../../../common/exceptions/domain.exception';
import { PropertyDataType } from '../enums/property-data-type.enum';

/**
 * Property - Агрегат для управления свойствами продуктов
 * Свойства используются для конфигурирования заказов
 */
export class Property {
  private id?: number;
  private name: string;
  private code: string;
  private dataType: PropertyDataType;
  private possibleValues: string | null; // JSON array для select/multi_select
  private defaultValue: string | null;
  private isRequired: boolean;
  private displayOrder: number;
  private isActive: boolean;
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(props: {
    id?: number;
    name: string;
    code: string;
    dataType: PropertyDataType;
    possibleValues?: string | null;
    defaultValue?: string | null;
    isRequired?: boolean;
    displayOrder?: number;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.code = props.code;
    this.dataType = props.dataType;
    this.possibleValues = props.possibleValues ?? null;
    this.defaultValue = props.defaultValue ?? null;
    this.isRequired = props.isRequired ?? false;
    this.displayOrder = props.displayOrder ?? 0;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();

    this.validate();
  }

  /**
   * Фабричный метод для создания нового свойства
   */
  static create(props: {
    name: string;
    code: string;
    dataType: PropertyDataType;
    possibleValues?: string[] | null;
    defaultValue?: string | null;
    isRequired?: boolean;
    displayOrder?: number;
  }): Property {
    // Сериализация возможных значений для select типов
    const possibleValuesJson = props.possibleValues
      ? JSON.stringify(props.possibleValues)
      : null;

    return new Property({
      ...props,
      possibleValues: possibleValuesJson,
    });
  }

  /**
   * Фабричный метод для восстановления из БД
   */
  static restore(props: {
    id: number;
    name: string;
    code: string;
    dataType: PropertyDataType;
    possibleValues: string | null;
    defaultValue: string | null;
    isRequired: boolean;
    displayOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Property {
    return new Property(props);
  }

  /**
   * Валидация инвариантов
   */
  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new DomainException('Название свойства не может быть пустым');
    }

    if (!this.code || this.code.trim().length === 0) {
      throw new DomainException('Код свойства не может быть пустым');
    }

    if (this.displayOrder < 0) {
      throw new DomainException('Порядок отображения не может быть отрицательным');
    }

    // Для select типов должны быть возможные значения
    if (
      (this.dataType === PropertyDataType.SELECT ||
        this.dataType === PropertyDataType.MULTI_SELECT) &&
      !this.possibleValues
    ) {
      throw new DomainException(
        `Для типа ${this.dataType} необходимо указать возможные значения`,
      );
    }
  }

  /**
   * Обновление информации о свойстве
   */
  updateInfo(props: {
    name?: string;
    possibleValues?: string[] | null;
    defaultValue?: string | null;
    isRequired?: boolean;
    displayOrder?: number;
  }): void {
    if (props.name !== undefined) {
      this.name = props.name;
    }

    if (props.possibleValues !== undefined) {
      this.possibleValues = props.possibleValues
        ? JSON.stringify(props.possibleValues)
        : null;
    }

    if (props.defaultValue !== undefined) {
      this.defaultValue = props.defaultValue;
    }

    if (props.isRequired !== undefined) {
      this.isRequired = props.isRequired;
    }

    if (props.displayOrder !== undefined) {
      if (props.displayOrder < 0) {
        throw new DomainException('Порядок отображения не может быть отрицательным');
      }
      this.displayOrder = props.displayOrder;
    }

    this.updatedAt = new Date();
    this.validate();
  }

  /**
   * Активация свойства
   */
  activate(): void {
    if (this.isActive) {
      throw new DomainException('Свойство уже активно');
    }
    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Деактивация свойства
   */
  deactivate(): void {
    if (!this.isActive) {
      throw new DomainException('Свойство уже деактивировано');
    }
    this.isActive = false;
    this.updatedAt = new Date();
  }

  /**
   * Получение возможных значений как массив
   */
  getPossibleValuesArray(): string[] | null {
    if (!this.possibleValues) return null;
    try {
      return JSON.parse(this.possibleValues);
    } catch {
      return null;
    }
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

  getDataType(): PropertyDataType {
    return this.dataType;
  }

  getPossibleValues(): string | null {
    return this.possibleValues;
  }

  getDefaultValue(): string | null {
    return this.defaultValue;
  }

  getIsRequired(): boolean {
    return this.isRequired;
  }

  getDisplayOrder(): number {
    return this.displayOrder;
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

import { DomainException } from '../../../../common/exceptions/domain.exception';

/**
 * PropertyValue - сущность для управления значениями свойств
 * Каждое значение может иметь привязанный модификатор цены
 */
export class PropertyValue {
  private id?: number;
  private propertyId: number;
  private value: string;
  private priceModifierId: number | null;
  private displayOrder: number;
  private isActive: boolean;
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(props: {
    id?: number;
    propertyId: number;
    value: string;
    priceModifierId?: number | null;
    displayOrder?: number;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.propertyId = props.propertyId;
    this.value = props.value;
    this.priceModifierId = props.priceModifierId ?? null;
    this.displayOrder = props.displayOrder ?? 0;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();

    this.validate();
  }

  /**
   * Фабричный метод для создания нового значения свойства
   */
  static create(props: {
    propertyId: number;
    value: string;
    priceModifierId?: number | null;
    displayOrder?: number;
  }): PropertyValue {
    return new PropertyValue(props);
  }

  /**
   * Фабричный метод для восстановления из БД
   */
  static restore(props: {
    id: number;
    propertyId: number;
    value: string;
    priceModifierId: number | null;
    displayOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): PropertyValue {
    return new PropertyValue(props);
  }

  /**
   * Валидация инвариантов
   */
  private validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new DomainException('Значение не может быть пустым');
    }

    if (this.propertyId <= 0) {
      throw new DomainException('ID свойства должно быть положительным числом');
    }

    if (this.displayOrder < 0) {
      throw new DomainException('Порядок отображения не может быть отрицательным');
    }
  }

  /**
   * Обновление информации о значении
   */
  updateInfo(props: {
    value?: string;
    priceModifierId?: number | null;
    displayOrder?: number;
  }): void {
    if (props.value !== undefined) {
      this.value = props.value;
    }

    if (props.priceModifierId !== undefined) {
      this.priceModifierId = props.priceModifierId;
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
   * Активация значения
   */
  activate(): void {
    if (this.isActive) {
      throw new DomainException('Значение уже активно');
    }
    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Деактивация значения
   */
  deactivate(): void {
    if (!this.isActive) {
      throw new DomainException('Значение уже деактивировано');
    }
    this.isActive = false;
    this.updatedAt = new Date();
  }

  // Getters
  getId(): number | undefined {
    return this.id;
  }

  getPropertyId(): number {
    return this.propertyId;
  }

  getValue(): string {
    return this.value;
  }

  getPriceModifierId(): number | null {
    return this.priceModifierId;
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
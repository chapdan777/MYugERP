import { DomainException } from '../../../../common/exceptions/domain.exception';

/**
 * PropertyHeaderItem - Сущность элемента шапки свойств
 * Представляет связь между шапкой и конкретным свойством со значением
 */
export class PropertyHeaderItem {
  private headerId: number;
  private propertyId: number;
  private value: string;
  private sortOrder: number;
  private createdAt: Date;

  private constructor(props: {
    headerId: number;
    propertyId: number;
    value: string;
    sortOrder?: number;
    createdAt?: Date;
  }) {
    this.headerId = props.headerId;
    this.propertyId = props.propertyId;
    this.value = props.value;
    this.sortOrder = props.sortOrder ?? 0;
    this.createdAt = props.createdAt ?? new Date();

    this.validate();
  }

  /**
   * Фабричный метод для создания нового элемента шапки
   */
  static create(props: {
    headerId: number;
    propertyId: number;
    value: string;
    sortOrder?: number;
  }): PropertyHeaderItem {
    return new PropertyHeaderItem(props);
  }

  /**
   * Фабричный метод для восстановления из БД
   */
  static restore(props: {
    headerId: number;
    propertyId: number;
    value: string;
    sortOrder?: number;
    createdAt: Date;
  }): PropertyHeaderItem {
    return new PropertyHeaderItem(props);
  }

  /**
   * Валидация инвариантов
   */
  private validate(): void {
    if (!this.headerId || this.headerId <= 0) {
      throw new DomainException('ID шапки должен быть положительным числом');
    }

    if (!this.propertyId || this.propertyId <= 0) {
      throw new DomainException('ID свойства должен быть положительным числом');
    }

    if (!this.value || this.value.trim().length === 0) {
      throw new DomainException('Значение свойства не может быть пустым');
    }

    if (this.value.trim().length > 1000) {
      throw new DomainException('Значение свойства не может превышать 1000 символов');
    }
  }

  /**
   * Обновление значения свойства
   */
  updateValue(newValue: string): void {
    this.value = newValue.trim();
    this.validate();
  }

  // Getters
  getHeaderId(): number {
    return this.headerId;
  }

  getPropertyId(): number {
    return this.propertyId;
  }

getValue(): string {
    return this.value;
  }

  getSortOrder(): number {
    return this.sortOrder;
  }

  setSortOrder(order: number): void {
    this.sortOrder = order;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}
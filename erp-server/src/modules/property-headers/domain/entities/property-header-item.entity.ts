import { DomainException } from '../../../../common/exceptions/domain.exception';

/**
 * PropertyHeaderItem - Сущность элемента шапки свойств
 * Представляет связь между шапкой и конкретным свойством (без значения)
 */
export class PropertyHeaderItem {
  private headerId: number;
  private propertyId: number;
  private sortOrder: number;
  private createdAt: Date;

  private constructor(props: {
    headerId: number;
    propertyId: number;
    sortOrder?: number;
    createdAt?: Date;
  }) {
    this.headerId = props.headerId;
    this.propertyId = props.propertyId;
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
  }

  // Getters
  getHeaderId(): number {
    return this.headerId;
  }

  getPropertyId(): number {
    return this.propertyId;
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
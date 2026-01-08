import { DomainException } from '../../../../common/exceptions/domain.exception';

/**
 * PropertyInOrder - сущность для хранения значения свойства в контексте заказа
 */
export class PropertyInOrder {
  private id?: number;
  private orderItemId: number;
  private propertyId: number;
  private propertyCode: string;
  private propertyName: string;
  private value: string;
  private createdAt: Date;

  private constructor(props: {
    id?: number;
    orderItemId: number;
    propertyId: number;
    propertyCode: string;
    propertyName: string;
    value: string;
    createdAt?: Date;
  }) {
    this.id = props.id;
    this.orderItemId = props.orderItemId;
    this.propertyId = props.propertyId;
    this.propertyCode = props.propertyCode;
    this.propertyName = props.propertyName;
    this.value = props.value;
    this.createdAt = props.createdAt ?? new Date();

    this.validate();
  }

  static create(props: {
    orderItemId: number;
    propertyId: number;
    propertyCode: string;
    propertyName: string;
    value: string;
  }): PropertyInOrder {
    return new PropertyInOrder(props);
  }

  static restore(props: {
    id: number;
    orderItemId: number;
    propertyId: number;
    propertyCode: string;
    propertyName: string;
    value: string;
    createdAt: Date;
  }): PropertyInOrder {
    return new PropertyInOrder(props);
  }

  private validate(): void {
    if (this.orderItemId <= 0) {
      throw new DomainException('ID позиции заказа должен быть положительным');
    }
    if (this.propertyId <= 0) {
      throw new DomainException('ID свойства должен быть положительным');
    }
    if (!this.propertyCode || this.propertyCode.trim().length === 0) {
      throw new DomainException('Код свойства не может быть пустым');
    }
    if (!this.value) {
      throw new DomainException('Значение свойства не может быть пустым');
    }
  }

  // Getters
  getId(): number | undefined {
    return this.id;
  }

  getOrderItemId(): number {
    return this.orderItemId;
  }

  getPropertyId(): number {
    return this.propertyId;
  }

  getPropertyCode(): string {
    return this.propertyCode;
  }

  getPropertyName(): string {
    return this.propertyName;
  }

  getValue(): string {
    return this.value;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}

/**
 * ProductProperty - связь между продуктом и свойством
 * Определяет, какие свойства применимы к данному продукту
 */
export class ProductProperty {
  private id?: number;
  private productId: number;
  private propertyId: number;
  private isRequired: boolean;
  private displayOrder: number;
  private createdAt: Date;

  private constructor(props: {
    id?: number;
    productId: number;
    propertyId: number;
    isRequired?: boolean;
    displayOrder?: number;
    createdAt?: Date;
  }) {
    this.id = props.id;
    this.productId = props.productId;
    this.propertyId = props.propertyId;
    this.isRequired = props.isRequired ?? false;
    this.displayOrder = props.displayOrder ?? 0;
    this.createdAt = props.createdAt ?? new Date();

    this.validate();
  }

  /**
   * Фабричный метод для создания связи продукт-свойство
   */
  static create(props: {
    productId: number;
    propertyId: number;
    isRequired?: boolean;
    displayOrder?: number;
  }): ProductProperty {
    return new ProductProperty(props);
  }

  /**
   * Фабричный метод для восстановления из БД
   */
  static restore(props: {
    id: number;
    productId: number;
    propertyId: number;
    isRequired: boolean;
    displayOrder: number;
    createdAt: Date;
  }): ProductProperty {
    return new ProductProperty(props);
  }

  /**
   * Валидация
   */
  private validate(): void {
    if (this.productId <= 0) {
      throw new Error('productId должен быть положительным числом');
    }

    if (this.propertyId <= 0) {
      throw new Error('propertyId должен быть положительным числом');
    }

    if (this.displayOrder < 0) {
      throw new Error('displayOrder не может быть отрицательным');
    }
  }

  /**
   * Изменение порядка отображения
   */
  changeDisplayOrder(newOrder: number): void {
    if (newOrder < 0) {
      throw new Error('displayOrder не может быть отрицательным');
    }
    this.displayOrder = newOrder;
  }

  /**
   * Установка обязательности свойства
   */
  setRequired(required: boolean): void {
    this.isRequired = required;
  }

  // Getters
  getId(): number | undefined {
    return this.id;
  }

  getProductId(): number {
    return this.productId;
  }

  getPropertyId(): number {
    return this.propertyId;
  }

  getIsRequired(): boolean {
    return this.isRequired;
  }

  getDisplayOrder(): number {
    return this.displayOrder;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}

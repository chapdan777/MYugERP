import { DomainException } from '../../../../common/exceptions/domain.exception';
import { PropertyInOrder } from './property-in-order.entity';

/**
 * OrderItem - сущность позиции заказа (изделие)
 */
export class OrderItem {
  private id?: number;
  private orderSectionId: number;
  private productId: number;
  private productName: string;
  private length?: number;
  private width?: number;
  private depth?: number;
  private quantity: number;
  private unit: number;
  private coefficient: number;
  private basePrice: number;
  private finalPrice: number;
  private totalPrice: number;
  private properties: PropertyInOrder[];
  private notes: string | null;
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(props: {
    id?: number;
    orderSectionId: number;
    productId: number;
    productName: string;
    quantity: number;
    length?: number;
    width?: number;
    depth?: number;
    unit: number;
    coefficient?: number;
    basePrice: number;
    finalPrice?: number;
    totalPrice?: number;
    properties?: PropertyInOrder[];
    notes?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.orderSectionId = props.orderSectionId;
    this.productId = props.productId;
    this.productName = props.productName;
    this.quantity = props.quantity;
    this.length = props.length;
    this.width = props.width;
    this.depth = props.depth;
    this.unit = props.unit;
    this.coefficient = props.coefficient ?? 1;
    this.basePrice = props.basePrice;
    this.finalPrice = props.finalPrice ?? props.basePrice;
    this.totalPrice = props.totalPrice ?? this.finalPrice * props.quantity;
    this.properties = props.properties ?? [];
    this.notes = props.notes ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();

    this.validate();
  }

  static create(props: {
    orderSectionId: number;
    productId: number;
    productName: string;
    quantity: number;
    length?: number;
    width?: number;
    depth?: number;
    unit: number;
    coefficient?: number;
    basePrice: number;
    notes?: string | null;
  }): OrderItem {
    return new OrderItem(props);
  }

  static restore(props: {
    id: number;
    orderSectionId: number;
    productId: number;
    productName: string;
    quantity: number;
    length?: number;
    width?: number;
    depth?: number;
    unit: number;
    coefficient: number;
    basePrice: number;
    finalPrice: number;
    totalPrice: number;
    properties: PropertyInOrder[];
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): OrderItem {
    return new OrderItem(props);
  }

  private validate(): void {
    if (this.productId <= 0) {
      throw new DomainException('ID продукта должен быть положительным');
    }
    if (this.quantity <= 0) {
      throw new DomainException('Количество должно быть положительным');
    }
    if (this.unit <= 0) {
      throw new DomainException('Единицы измерения должны быть положительными');
    }
    if (this.coefficient <= 0) {
      throw new DomainException('Коэффициент должен быть положительным');
    }
    if (this.basePrice < 0) {
      throw new DomainException('Базовая цена не может быть отрицательной');
    }
  }

  addProperty(property: PropertyInOrder): void {
    const exists = this.properties.some(p => p.getPropertyId() === property.getPropertyId());
    if (exists) {
      throw new DomainException(`Свойство ${property.getPropertyCode()} уже добавлено к позиции`);
    }

    this.properties.push(property);
    this.updatedAt = new Date();
  }

  updatePrices(finalPrice: number, totalPrice: number): void {
    if (finalPrice < 0 || totalPrice < 0) {
      throw new DomainException('Цены не могут быть отрицательными');
    }

    this.finalPrice = finalPrice;
    this.totalPrice = totalPrice;
    this.updatedAt = new Date();
  }

  updateQuantity(quantity: number): void {
    if (quantity <= 0) {
      throw new DomainException('Количество должно быть положительным');
    }

    this.quantity = quantity;
    this.totalPrice = this.finalPrice * quantity;
    this.updatedAt = new Date();
  }

  updateNotes(notes: string | null): void {
    this.notes = notes;
    this.updatedAt = new Date();
  }

  // Getters
  getId(): number | undefined {
    return this.id;
  }

  getOrderSectionId(): number {
    return this.orderSectionId;
  }

  getProductId(): number {
    return this.productId;
  }

  getProductName(): string {
    return this.productName;
  }

  getQuantity(): number {
    return this.quantity;
  }

  getLength(): number | undefined {
    return this.length;
  }

  getWidth(): number | undefined {
    return this.width;
  }

  getDepth(): number | undefined {
    return this.depth;
  }

  getUnit(): number {
    return this.unit;
  }

  getCoefficient(): number {
    return this.coefficient;
  }

  getBasePrice(): number {
    return this.basePrice;
  }

  getFinalPrice(): number {
    return this.finalPrice;
  }

  getTotalPrice(): number {
    return this.totalPrice;
  }

  getProperties(): PropertyInOrder[] {
    return [...this.properties];
  }

  getNotes(): string | null {
    return this.notes;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}

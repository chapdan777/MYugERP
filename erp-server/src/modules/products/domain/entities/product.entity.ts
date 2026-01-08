import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ProductCategory } from '../enums/product-category.enum';
import { UnitOfMeasure } from '../value-objects/unit-of-measure.vo';

/**
 * Product - Агрегат для управления продуктами
 * Содержит информацию о типе продукции и связанных свойствах
 */
export class Product {
  private id?: number;
  private name: string;
  private code: string;
  private category: ProductCategory;
  private description: string | null;
  private basePrice: number;
  private unit: UnitOfMeasure;
  private isActive: boolean;
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(props: {
    id?: number;
    name: string;
    code: string;
    category: ProductCategory;
    description?: string | null;
    basePrice: number;
    unit: UnitOfMeasure;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.code = props.code;
    this.category = props.category;
    this.description = props.description ?? null;
    this.basePrice = props.basePrice;
    this.unit = props.unit;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();

    this.validate();
  }

  /**
   * Фабричный метод для создания нового продукта
   */
  static create(props: {
    name: string;
    code: string;
    category: ProductCategory;
    description?: string | null;
    basePrice: number;
    unit: UnitOfMeasure;
  }): Product {
    return new Product(props);
  }

  /**
   * Фабричный метод для восстановления продукта из БД
   */
  static restore(props: {
    id: number;
    name: string;
    code: string;
    category: ProductCategory;
    description: string | null;
    basePrice: number;
    unit: UnitOfMeasure;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Product {
    return new Product(props);
  }

  /**
   * Валидация инвариантов
   */
  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new DomainException('Название продукта не может быть пустым');
    }

    if (!this.code || this.code.trim().length === 0) {
      throw new DomainException('Код продукта не может быть пустым');
    }

    if (this.basePrice < 0) {
      throw new DomainException('Базовая цена не может быть отрицательной');
    }
  }

  /**
   * Обновление информации о продукте
   */
  updateInfo(props: {
    name?: string;
    description?: string | null;
    basePrice?: number;
    unit?: UnitOfMeasure;
    category?: ProductCategory;
  }): void {
    if (props.name !== undefined) {
      this.name = props.name;
    }

    if (props.description !== undefined) {
      this.description = props.description;
    }

    if (props.basePrice !== undefined) {
      if (props.basePrice < 0) {
        throw new DomainException('Базовая цена не может быть отрицательной');
      }
      this.basePrice = props.basePrice;
    }

    if (props.unit !== undefined) {
      this.unit = props.unit;
    }

    if (props.category !== undefined) {
      this.category = props.category;
    }

    this.updatedAt = new Date();
    this.validate();
  }

  /**
   * Активация продукта
   */
  activate(): void {
    if (this.isActive) {
      throw new DomainException('Продукт уже активен');
    }
    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Деактивация продукта
   */
  deactivate(): void {
    if (!this.isActive) {
      throw new DomainException('Продукт уже деактивирован');
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

  getCategory(): ProductCategory {
    return this.category;
  }

  getDescription(): string | null {
    return this.description;
  }

  getBasePrice(): number {
    return this.basePrice;
  }

  getUnit(): UnitOfMeasure {
    return this.unit;
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

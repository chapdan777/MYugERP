import { DomainException } from '../../../../common/exceptions/domain.exception';

/**
 * PropertyHeader - Агрегат для управления шапками свойств
 * Шапки используются для группировки часто используемых комбинаций свойств
 */
export class PropertyHeader {
  private id?: number;
  private name: string;
  private orderTypeId: number;
  private description: string | null;
  private isActive: boolean;
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(props: {
    id?: number;
    name: string;
    orderTypeId: number;
    description?: string | null;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.orderTypeId = props.orderTypeId;
    this.description = props.description ?? null;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();

    this.validate();
  }

  /**
   * Фабричный метод для создания новой шапки свойств
   */
  static create(props: {
    name: string;
    orderTypeId: number;
    description?: string | null;
  }): PropertyHeader {
    return new PropertyHeader({
      ...props,
      isActive: true,
    });
  }

  /**
   * Фабричный метод для восстановления из БД
   */
  static restore(props: {
    id: number;
    name: string;
    orderTypeId: number;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): PropertyHeader {
    return new PropertyHeader(props);
  }

  /**
   * Валидация инвариантов
   */
  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new DomainException('Название шапки не может быть пустым');
    }

    if (this.name.trim().length > 255) {
      throw new DomainException('Название шапки не может превышать 255 символов');
    }

    if (!this.orderTypeId || this.orderTypeId <= 0) {
      throw new DomainException('Тип заказа должен быть указан');
    }
  }

  /**
   * Обновление информации о шапке
   */
  updateInfo(props: {
    name?: string;
    description?: string | null;
  }): void {
    if (props.name !== undefined) {
      this.name = props.name.trim();
    }

    if (props.description !== undefined) {
      this.description = props.description?.trim() || null;
    }

    this.updatedAt = new Date();
    this.validate();
  }

  /**
   * Активация шапки
   */
  activate(): void {
    if (this.isActive) {
      throw new DomainException('Шапка уже активна');
    }
    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Деактивация шапки
   */
  deactivate(): void {
    if (!this.isActive) {
      throw new DomainException('Шапка уже деактивирована');
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

  getOrderTypeId(): number {
    return this.orderTypeId;
  }

  getDescription(): string | null {
    return this.description;
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
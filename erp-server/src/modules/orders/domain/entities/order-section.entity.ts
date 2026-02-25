import { DomainException } from '../../../../common/exceptions/domain.exception';
import { OrderItem } from './order-item.entity';

/**
 * OrderSection - сущность секции заказа (шапка)
 */
export class OrderSection {
  private id?: number;
  private orderId: number;
  private sectionNumber: number;
  private name: string;
  private headerId: number | null;
  private description: string | null;
  private items: OrderItem[];
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(props: {
    id?: number;
    orderId: number;
    sectionNumber: number;
    name: string;
    headerId?: number | null;
    description?: string | null;
    items?: OrderItem[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.orderId = props.orderId;
    this.sectionNumber = props.sectionNumber;
    this.name = props.name;
    this.headerId = props.headerId ?? null;
    this.description = props.description ?? null;
    this.items = props.items ?? [];
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();

    this.validate();
  }

  static create(props: {
    orderId: number;
    sectionNumber: number;
    name: string;
    headerId?: number | null;
    description?: string | null;
  }): OrderSection {
    return new OrderSection(props);
  }

  static restore(props: {
    id: number;
    orderId: number;
    sectionNumber: number;
    name: string;
    headerId: number | null;
    description: string | null;
    items: OrderItem[];
    createdAt: Date;
    updatedAt: Date;
  }): OrderSection {
    return new OrderSection(props);
  }

  private validate(): void {
    if (this.sectionNumber < 0) {
      throw new DomainException('Номер секции не может быть отрицательным');
    }
    if (!this.name || this.name.trim().length === 0) {
      throw new DomainException('Название секции не может быть пустым');
    }
  }

  /**
   * Добавление позиции в секцию
   */
  addItem(item: OrderItem): void {
    this.items.push(item);
    this.updatedAt = new Date();
  }

  /**
   * Удаление позиции из секции
   */
  removeItem(itemId: number): void {
    const index = this.items.findIndex(item => item.getId() === itemId);
    if (index === -1) {
      throw new DomainException(`Позиция с ID ${itemId} не найдена в секции`);
    }

    this.items.splice(index, 1);
    this.updatedAt = new Date();
  }

  /**
   * Обновление информации о секции
   */
  updateInfo(props: {
    name?: string;
    description?: string | null;
  }): void {
    if (props.name !== undefined) {
      this.name = props.name;
    }
    if (props.description !== undefined) {
      this.description = props.description;
    }

    this.updatedAt = new Date();
    this.validate();
  }

  /**
   * Получение общей стоимости секции
   */
  getTotalAmount(): number {
    return this.items.reduce((sum, item) => sum + item.getTotalPrice(), 0);
  }

  // Getters
  getId(): number | undefined {
    return this.id;
  }

  getOrderId(): number {
    return this.orderId;
  }

  getSectionNumber(): number {
    return this.sectionNumber;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string | null {
    return this.description;
  }

  getHeaderId(): number | null {
    return this.headerId;
  }

  getItems(): OrderItem[] {
    return [...this.items];
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}

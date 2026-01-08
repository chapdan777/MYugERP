import { DomainException } from '../../../../common/exceptions/domain.exception';

/**
 * OrderSectionTemplate - сущность для шаблона секции заказа
 * Определяет стандартные секции, которые должны быть в заказе
 */
export class OrderSectionTemplate {
  private id?: number;
  private templateId: number; // Связь с OrderTemplate
  private sectionNumber: number; // Номер секции (порядок отображения)
  private defaultName: string; // Название секции по умолчанию
  private description: string | null;
  private isRequired: boolean; // Обязательная ли секция
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(props: {
    id?: number;
    templateId: number;
    sectionNumber: number;
    defaultName: string;
    description?: string | null;
    isRequired?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.templateId = props.templateId;
    this.sectionNumber = props.sectionNumber;
    this.defaultName = props.defaultName;
    this.description = props.description ?? null;
    this.isRequired = props.isRequired ?? false;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();

    this.validate();
  }

  /**
   * Фабричный метод для создания нового шаблона секции
   */
  static create(props: {
    templateId: number;
    sectionNumber: number;
    defaultName: string;
    description?: string | null;
    isRequired?: boolean;
  }): OrderSectionTemplate {
    return new OrderSectionTemplate(props);
  }

  /**
   * Фабричный метод для восстановления из БД
   */
  static restore(props: {
    id: number;
    templateId: number;
    sectionNumber: number;
    defaultName: string;
    description: string | null;
    isRequired: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): OrderSectionTemplate {
    return new OrderSectionTemplate(props);
  }

  /**
   * Валидация инвариантов
   */
  private validate(): void {
    if (this.templateId <= 0) {
      throw new DomainException('ID шаблона должен быть положительным числом');
    }

    if (this.sectionNumber < 0) {
      throw new DomainException('Номер секции не может быть отрицательным');
    }

    if (!this.defaultName || this.defaultName.trim().length === 0) {
      throw new DomainException('Название секции не может быть пустым');
    }
  }

  /**
   * Обновление информации о шаблоне секции
   */
  updateInfo(props: {
    sectionNumber?: number;
    defaultName?: string;
    description?: string | null;
    isRequired?: boolean;
  }): void {
    if (props.sectionNumber !== undefined) {
      if (props.sectionNumber < 0) {
        throw new DomainException('Номер секции не может быть отрицательным');
      }
      this.sectionNumber = props.sectionNumber;
    }

    if (props.defaultName !== undefined) {
      this.defaultName = props.defaultName;
    }

    if (props.description !== undefined) {
      this.description = props.description;
    }

    if (props.isRequired !== undefined) {
      this.isRequired = props.isRequired;
    }

    this.updatedAt = new Date();
    this.validate();
  }

  // Getters
  getId(): number | undefined {
    return this.id;
  }

  getTemplateId(): number {
    return this.templateId;
  }

  getSectionNumber(): number {
    return this.sectionNumber;
  }

  getDefaultName(): string {
    return this.defaultName;
  }

  getDescription(): string | null {
    return this.description;
  }

  getIsRequired(): boolean {
    return this.isRequired;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}

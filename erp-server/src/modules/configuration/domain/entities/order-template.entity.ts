import { DomainException } from '../../../../common/exceptions/domain.exception';
import { OrderSectionTemplate } from './order-section-template.entity';

/**
 * OrderTemplate - агрегат для шаблонов заказов
 * Шаблоны позволяют быстро создавать заказы с предопределенной структурой
 */
export class OrderTemplate {
  private id?: number;
  private name: string;
  private code: string; // Уникальный код шаблона
  private description: string | null;
  private isActive: boolean;
  private sections: OrderSectionTemplate[]; // Секции шаблона
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(props: {
    id?: number;
    name: string;
    code: string;
    description?: string | null;
    isActive?: boolean;
    sections?: OrderSectionTemplate[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.code = props.code;
    this.description = props.description ?? null;
    this.isActive = props.isActive ?? true;
    this.sections = props.sections ?? [];
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();

    this.validate();
  }

  /**
   * Фабричный метод для создания нового шаблона
   */
  static create(props: {
    name: string;
    code: string;
    description?: string | null;
  }): OrderTemplate {
    return new OrderTemplate(props);
  }

  /**
   * Фабричный метод для восстановления из БД
   */
  static restore(props: {
    id: number;
    name: string;
    code: string;
    description: string | null;
    isActive: boolean;
    sections: OrderSectionTemplate[];
    createdAt: Date;
    updatedAt: Date;
  }): OrderTemplate {
    return new OrderTemplate(props);
  }

  /**
   * Валидация инвариантов
   */
  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new DomainException('Название шаблона не может быть пустым');
    }

    if (!this.code || this.code.trim().length === 0) {
      throw new DomainException('Код шаблона не может быть пустым');
    }

    // Проверка уникальности номеров секций
    const sectionNumbers = this.sections.map(s => s.getSectionNumber());
    const uniqueNumbers = new Set(sectionNumbers);
    if (sectionNumbers.length !== uniqueNumbers.size) {
      throw new DomainException('Номера секций должны быть уникальными в рамках шаблона');
    }
  }

  /**
   * Обновление информации о шаблоне
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
   * Добавление секции в шаблон
   */
  addSection(section: OrderSectionTemplate): void {
    // Проверка, что секция принадлежит этому шаблону
    if (this.id && section.getTemplateId() !== this.id) {
      throw new DomainException('Секция должна принадлежать этому шаблону');
    }

    // Проверка уникальности номера секции
    const exists = this.sections.some(
      s => s.getSectionNumber() === section.getSectionNumber(),
    );
    if (exists) {
      throw new DomainException(
        `Секция с номером ${section.getSectionNumber()} уже существует в шаблоне`,
      );
    }

    this.sections.push(section);
    this.updatedAt = new Date();
  }

  /**
   * Удаление секции из шаблона
   */
  removeSection(sectionNumber: number): void {
    const index = this.sections.findIndex(
      s => s.getSectionNumber() === sectionNumber,
    );

    if (index === -1) {
      throw new DomainException(`Секция с номером ${sectionNumber} не найдена в шаблоне`);
    }

    // Проверка, что секция не является обязательной
    if (this.sections[index].getIsRequired()) {
      throw new DomainException('Нельзя удалить обязательную секцию');
    }

    this.sections.splice(index, 1);
    this.updatedAt = new Date();
  }

  /**
   * Получение секции по номеру
   */
  getSectionByNumber(sectionNumber: number): OrderSectionTemplate | null {
    return this.sections.find(s => s.getSectionNumber() === sectionNumber) ?? null;
  }

  /**
   * Активация шаблона
   */
  activate(): void {
    if (this.isActive) {
      throw new DomainException('Шаблон уже активен');
    }
    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Деактивация шаблона
   */
  deactivate(): void {
    if (!this.isActive) {
      throw new DomainException('Шаблон уже деактивирован');
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

  getDescription(): string | null {
    return this.description;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  getSections(): OrderSectionTemplate[] {
    return [...this.sections]; // Возвращаем копию для защиты инкапсуляции
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}

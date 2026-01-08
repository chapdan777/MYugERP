import { DomainException } from '../../../../common/filters/domain-exception.filter';

/**
 * Value Object для Email
 * Инкапсулирует логику валидации email адреса
 */
export class Email {
  private readonly value: string;

  private constructor(email: string) {
    this.value = email;
  }

  /**
   * Фабричный метод для создания Email
   */
  static create(email: string): Email {
    if (!email || email.trim().length === 0) {
      throw new DomainException('Email не может быть пустым');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new DomainException('Невалидный формат email');
    }

    return new Email(email.toLowerCase().trim());
  }

  /**
   * Получить значение email
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Сравнение с другим Email
   */
  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

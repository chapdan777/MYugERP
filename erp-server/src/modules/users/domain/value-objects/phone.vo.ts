import { DomainException } from '../../../../common/filters/domain-exception.filter';

/**
 * Value Object для телефонного номера
 * Инкапсулирует логику валидации и форматирования телефона
 */
export class Phone {
  private readonly value: string;

  private constructor(phone: string) {
    this.value = phone;
  }

  /**
   * Фабричный метод для создания Phone
   * Принимает телефон в различных форматах и нормализует его
   */
  static create(phone: string | null): Phone | null {
    if (!phone) {
      return null;
    }

    // Удаляем все символы кроме цифр и +
    const cleaned = phone.replace(/[^\d+]/g, '');

    if (cleaned.length === 0) {
      throw new DomainException('Телефон не может быть пустым');
    }

    // Базовая валидация: от 10 до 15 цифр (международный формат)
    const digitsOnly = cleaned.replace(/\+/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      throw new DomainException('Невалидный формат телефона');
    }

    return new Phone(cleaned);
  }

  /**
   * Получить значение телефона
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Сравнение с другим Phone
   */
  equals(other: Phone): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

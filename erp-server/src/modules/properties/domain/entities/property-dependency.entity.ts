import { DomainException } from '../../../../common/exceptions/domain.exception';
import { DependencyType } from '../enums/dependency-type.enum';

/**
 * PropertyDependency - сущность для управления зависимостями между свойствами
 * Определяет правила, как одно свойство влияет на другое
 */
export class PropertyDependency {
  private id?: number;
  private sourcePropertyId: number;
  private targetPropertyId: number;
  private dependencyType: DependencyType;
  private sourceValue: string | null; // Значение source, при котором срабатывает зависимость
  private targetValue: string | null; // Значение для установки в target (для SETS_VALUE)
  private isActive: boolean;
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(props: {
    id?: number;
    sourcePropertyId: number;
    targetPropertyId: number;
    dependencyType: DependencyType;
    sourceValue?: string | null;
    targetValue?: string | null;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.sourcePropertyId = props.sourcePropertyId;
    this.targetPropertyId = props.targetPropertyId;
    this.dependencyType = props.dependencyType;
    this.sourceValue = props.sourceValue ?? null;
    this.targetValue = props.targetValue ?? null;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();

    this.validate();
  }

  /**
   * Фабричный метод для создания новой зависимости
   */
  static create(props: {
    sourcePropertyId: number;
    targetPropertyId: number;
    dependencyType: DependencyType;
    sourceValue?: string | null;
    targetValue?: string | null;
  }): PropertyDependency {
    return new PropertyDependency(props);
  }

  /**
   * Фабричный метод для восстановления из БД
   */
  static restore(props: {
    id: number;
    sourcePropertyId: number;
    targetPropertyId: number;
    dependencyType: DependencyType;
    sourceValue: string | null;
    targetValue: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): PropertyDependency {
    return new PropertyDependency(props);
  }

  /**
   * Валидация инвариантов
   */
  private validate(): void {
    if (this.sourcePropertyId <= 0) {
      throw new DomainException('sourcePropertyId должен быть положительным числом');
    }

    if (this.targetPropertyId <= 0) {
      throw new DomainException('targetPropertyId должен быть положительным числом');
    }

    if (this.sourcePropertyId === this.targetPropertyId) {
      throw new DomainException('Свойство не может зависеть от самого себя');
    }

    // Для SETS_VALUE необходимо указать targetValue
    if (this.dependencyType === DependencyType.SETS_VALUE && !this.targetValue) {
      throw new DomainException(
        'Для типа зависимости SETS_VALUE необходимо указать targetValue',
      );
    }
  }

  /**
   * Проверка, срабатывает ли зависимость для данного значения
   */
  isTriggeredBy(value: string | null): boolean {
    // Если не указано sourceValue, зависимость срабатывает всегда при наличии любого значения
    if (!this.sourceValue) {
      return value !== null && value !== undefined;
    }

    // Иначе проверяем точное совпадение
    return this.sourceValue === value;
  }

  /**
   * Активация зависимости
   */
  activate(): void {
    if (this.isActive) {
      throw new DomainException('Зависимость уже активна');
    }
    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Деактивация зависимости
   */
  deactivate(): void {
    if (!this.isActive) {
      throw new DomainException('Зависимость уже деактивирована');
    }
    this.isActive = false;
    this.updatedAt = new Date();
  }

  // Getters
  getId(): number | undefined {
    return this.id;
  }

  getSourcePropertyId(): number {
    return this.sourcePropertyId;
  }

  getTargetPropertyId(): number {
    return this.targetPropertyId;
  }

  getDependencyType(): DependencyType {
    return this.dependencyType;
  }

  getSourceValue(): string | null {
    return this.sourceValue;
  }

  getTargetValue(): string | null {
    return this.targetValue;
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

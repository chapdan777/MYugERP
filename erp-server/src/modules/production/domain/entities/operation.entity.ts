import { DomainException } from '../../../../common/exceptions/domain.exception';
import { OperationCalculationType } from '../enums/operation-calculation-type.enum';

/**
 * Производственная операция
 * @description Представляет операцию производственного процесса (фрезеровка, сверление, покраска и т.д.)
 */
export class Operation {
  private id?: number;
  private code: string;
  private name: string;
  private description: string | null;
  private calculationType: OperationCalculationType;
  private defaultTimePerUnit: number;
  private defaultRatePerUnit: number;
  private isActive: boolean;
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(props: {
    id?: number;
    code: string;
    name: string;
    description?: string | null;
    calculationType?: OperationCalculationType;
    defaultTimePerUnit?: number;
    defaultRatePerUnit?: number;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.code = props.code;
    this.name = props.name;
    this.description = props.description ?? null;
    this.calculationType = props.calculationType ?? OperationCalculationType.PER_PIECE;
    this.defaultTimePerUnit = props.defaultTimePerUnit ?? 0;
    this.defaultRatePerUnit = props.defaultRatePerUnit ?? 0;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();

    this.validate();
  }

  /**
   * Фабричный метод для создания новой операции
   */
  static create(props: {
    code: string;
    name: string;
    description?: string | null;
    calculationType?: OperationCalculationType;
    defaultTimePerUnit?: number;
    defaultRatePerUnit?: number;
    isActive?: boolean;
  }): Operation {
    return new Operation(props);
  }

  /**
   * Фабричный метод для восстановления из базы данных
   */
  static restore(props: {
    id: number;
    code: string;
    name: string;
    description: string | null;
    calculationType: OperationCalculationType;
    defaultTimePerUnit: number;
    defaultRatePerUnit: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Operation {
    return new Operation(props);
  }

  /**
   * Валидация инвариантов операции
   */
  private validate(): void {
    if (!this.code || this.code.trim().length === 0) {
      throw new DomainException('Код операции обязателен');
    }
    if (!this.name || this.name.trim().length === 0) {
      throw new DomainException('Название операции обязательно');
    }
    if (this.defaultTimePerUnit < 0) {
      throw new DomainException('Норма времени не может быть отрицательной');
    }
    if (this.defaultRatePerUnit < 0) {
      throw new DomainException('Расценка не может быть отрицательной');
    }
  }

  /**
   * Обновить информацию об операции
   */
  updateInfo(props: {
    name?: string;
    description?: string | null;
    calculationType?: OperationCalculationType;
    defaultTimePerUnit?: number;
    defaultRatePerUnit?: number;
    isActive?: boolean;
  }): void {
    if (props.name !== undefined) {
      if (!props.name || props.name.trim().length === 0) {
        throw new DomainException('Название операции не может быть пустым');
      }
      this.name = props.name.trim();
    }

    if (props.description !== undefined) {
      this.description = props.description;
    }

    if (props.calculationType !== undefined) {
      this.calculationType = props.calculationType;
    }

    if (props.defaultTimePerUnit !== undefined) {
      if (props.defaultTimePerUnit < 0) {
        throw new DomainException('Норма времени не может быть отрицательной');
      }
      this.defaultTimePerUnit = props.defaultTimePerUnit;
    }

    if (props.defaultRatePerUnit !== undefined) {
      if (props.defaultRatePerUnit < 0) {
        throw new DomainException('Расценка не может быть отрицательной');
      }
      this.defaultRatePerUnit = props.defaultRatePerUnit;
    }

    if (props.isActive !== undefined) {
      this.isActive = props.isActive;
    }

    this.updatedAt = new Date();
  }

  /**
   * Активировать операцию
   */
  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Деактивировать операцию
   */
  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  // Геттеры
  getId(): number | undefined {
    return this.id;
  }

  getCode(): string {
    return this.code;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string | null {
    return this.description;
  }

  getCalculationType(): OperationCalculationType {
    return this.calculationType;
  }

  getDefaultTimePerUnit(): number {
    return this.defaultTimePerUnit;
  }

  getDefaultRatePerUnit(): number {
    return this.defaultRatePerUnit;
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

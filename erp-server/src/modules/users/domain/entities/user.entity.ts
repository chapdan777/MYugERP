import { DomainException, InvariantViolationException } from '../../../../common/filters/domain-exception.filter';
import { Email, Phone } from '../value-objects';
import { UserRole } from '../enums';

/**
 * Доменная сущность User (Aggregate Root)
 * Представляет пользователя системы с любой ролью
 * 
 * Инварианты:
 * - Username должен быть уникальным и не пустым
 * - Password hash обязателен
 * - Role должна быть валидной из enum UserRole
 * - Email должен быть валидным (если указан)
 * - Пользователь не может быть одновременно активным и удаленным
 */
export class User {
  private id?: number;
  private username: string;
  private passwordHash: string;
  private role: UserRole;
  private fullName: string | null;
  private email: Email | null;
  private phone: Phone | null;
  private isActive: boolean;
  private isDeleted: boolean;
  private createdAt: Date;
  private updatedAt: Date;
  private lastLoginAt: Date | null;

  private constructor(props: {
    id?: number;
    username: string;
    passwordHash: string;
    role: UserRole;
    fullName?: string | null;
    email?: Email | null;
    phone?: Phone | null;
    isActive?: boolean;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    lastLoginAt?: Date | null;
  }) {
    this.id = props.id;
    this.username = props.username;
    this.passwordHash = props.passwordHash;
    this.role = props.role;
    this.fullName = props.fullName ?? null;
    this.email = props.email ?? null;
    this.phone = props.phone ?? null;
    this.isActive = props.isActive ?? true;
    this.isDeleted = props.isDeleted ?? false;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
    this.lastLoginAt = props.lastLoginAt ?? null;

    this.validate();
  }

  /**
   * Фабричный метод для создания нового пользователя
   */
  static create(props: {
    username: string;
    passwordHash: string;
    role: UserRole;
    fullName?: string | null;
    email?: Email | null;
    phone?: Phone | null;
  }): User {
    return new User({
      username: props.username,
      passwordHash: props.passwordHash,
      role: props.role,
      fullName: props.fullName,
      email: props.email,
      phone: props.phone,
    });
  }

  /**
   * Фабричный метод для восстановления пользователя из БД
   */
  static restore(props: {
    id: number;
    username: string;
    passwordHash: string;
    role: UserRole;
    fullName: string | null;
    email: Email | null;
    phone: Phone | null;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date | null;
  }): User {
    return new User(props);
  }

  /**
   * Валидация инвариантов
   */
  private validate(): void {
    if (!this.username || this.username.trim().length === 0) {
      throw new InvariantViolationException('Username не может быть пустым');
    }

    if (this.username.length < 3) {
      throw new InvariantViolationException('Username должен содержать минимум 3 символа');
    }

    if (!this.passwordHash || this.passwordHash.length === 0) {
      throw new InvariantViolationException('Password hash обязателен');
    }

    if (!Object.values(UserRole).includes(this.role)) {
      throw new InvariantViolationException(`Невалидная роль: ${this.role}`);
    }

    if (this.isActive && this.isDeleted) {
      throw new InvariantViolationException('Пользователь не может быть одновременно активным и удаленным');
    }
  }

  // ==================== Геттеры ====================

  getId(): number | undefined {
    return this.id;
  }

  getUsername(): string {
    return this.username;
  }

  getPasswordHash(): string {
    return this.passwordHash;
  }

  getRole(): UserRole {
    return this.role;
  }

  getFullName(): string | null {
    return this.fullName;
  }

  getEmail(): Email | null {
    return this.email;
  }

  getPhone(): Phone | null {
    return this.phone;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  getIsDeleted(): boolean {
    return this.isDeleted;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getLastLoginAt(): Date | null {
    return this.lastLoginAt;
  }

  // ==================== Бизнес-методы ====================

  /**
   * Обновление профиля пользователя
   */
  updateProfile(props: {
    fullName?: string;
    email?: Email;
    phone?: Phone;
  }): void {
    if (this.isDeleted) {
      throw new DomainException('Невозможно обновить удаленного пользователя');
    }

    if (props.fullName !== undefined) {
      this.fullName = props.fullName || null;
    }

    if (props.email !== undefined) {
      this.email = props.email;
    }

    if (props.phone !== undefined) {
      this.phone = props.phone;
    }

    this.updatedAt = new Date();
  }

  /**
   * Изменение пароля
   */
  changePassword(newPasswordHash: string): void {
    if (this.isDeleted) {
      throw new DomainException('Невозможно изменить пароль удаленного пользователя');
    }

    if (!newPasswordHash || newPasswordHash.length === 0) {
      throw new DomainException('Password hash не может быть пустым');
    }

    this.passwordHash = newPasswordHash;
    this.updatedAt = new Date();
  }

  /**
   * Изменение роли пользователя
   */
  changeRole(newRole: UserRole): void {
    if (this.isDeleted) {
      throw new DomainException('Невозможно изменить роль удаленного пользователя');
    }

    if (!Object.values(UserRole).includes(newRole)) {
      throw new DomainException(`Невалидная роль: ${newRole}`);
    }

    this.role = newRole;
    this.updatedAt = new Date();
  }

  /**
   * Активация пользователя
   */
  activate(): void {
    if (this.isDeleted) {
      throw new DomainException('Невозможно активировать удаленного пользователя');
    }

    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Деактивация пользователя
   */
  deactivate(): void {
    if (this.isDeleted) {
      throw new DomainException('Невозможно деактивировать удаленного пользователя');
    }

    this.isActive = false;
    this.updatedAt = new Date();
  }

  /**
   * Мягкое удаление пользователя
   */
  softDelete(): void {
    if (this.isDeleted) {
      throw new DomainException('Пользователь уже удален');
    }

    this.isDeleted = true;
    this.isActive = false;
    this.updatedAt = new Date();
  }

  /**
   * Восстановление удаленного пользователя
   */
  restore(): void {
    if (!this.isDeleted) {
      throw new DomainException('Пользователь не был удален');
    }

    this.isDeleted = false;
    this.updatedAt = new Date();
  }

  /**
   * Регистрация входа в систему
   */
  recordLogin(): void {
    if (!this.isActive) {
      throw new DomainException('Пользователь неактивен');
    }

    if (this.isDeleted) {
      throw new DomainException('Пользователь удален');
    }

    this.lastLoginAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Проверка прав доступа по роли
   */
  hasRole(role: UserRole): boolean {
    return this.role === role;
  }

  /**
   * Проверка, является ли пользователь администратором
   */
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  /**
   * Проверка, может ли пользователь войти в систему
   */
  canLogin(): boolean {
    return this.isActive && !this.isDeleted;
  }
}


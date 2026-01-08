import { User } from '../entities/user.entity';
import { UserRole } from '../enums';

/**
 * Abstract class репозитория для User (порт в терминах Clean Architecture)
 * Определяет контракт для работы с пользователями независимо от конкретной реализации
 * Используется abstract class вместо interface для совместимости с TypeScript decorators
 */
export abstract class IUserRepository {
  /**
   * Сохранить пользователя (создание или обновление)
   */
  abstract save(user: User): Promise<User>;

  /**
   * Найти пользователя по ID
   */
  abstract findById(id: number): Promise<User | null>;

  /**
   * Найти пользователя по username
   */
  abstract findByUsername(username: string): Promise<User | null>;

  /**
   * Найти пользователя по email
   */
  abstract findByEmail(email: string): Promise<User | null>;

  /**
   * Найти всех пользователей с заданной ролью
   */
  abstract findByRole(role: UserRole): Promise<User[]>;

  /**
   * Найти всех активных пользователей
   */
  abstract findAllActive(): Promise<User[]>;

  /**
   * Найти всех пользователей (включая неактивных и удаленных)
   */
  abstract findAll(): Promise<User[]>;

  /**
   * Проверить существование username
   */
  abstract existsByUsername(username: string): Promise<boolean>;

  /**
   * Проверить существование email
   */
  abstract existsByEmail(email: string): Promise<boolean>;

  /**
   * Удалить пользователя (физическое удаление)
   */
  abstract delete(id: number): Promise<void>;
}

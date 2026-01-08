import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums';

/**
 * Response DTO для пользователя (без чувствительных данных)
 */
export class UserResponseDto {
  id: number;
  username: string;
  role: UserRole;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;

  constructor(user: User) {
    this.id = user.getId()!;
    this.username = user.getUsername();
    this.role = user.getRole();
    this.fullName = user.getFullName();
    this.email = user.getEmail()?.getValue() ?? null;
    this.phone = user.getPhone()?.getValue() ?? null;
    this.isActive = user.getIsActive();
    this.createdAt = user.getCreatedAt();
    this.updatedAt = user.getUpdatedAt();
    this.lastLoginAt = user.getLastLoginAt();
  }

  /**
   * Преобразование доменной модели User в DTO
   */
  static fromDomain(user: User): UserResponseDto {
    return new UserResponseDto(user);
  }

  /**
   * Преобразование массива доменных моделей в массив DTO
   */
  static fromDomainList(users: User[]): UserResponseDto[] {
    return users.map((user) => UserResponseDto.fromDomain(user));
  }
}

import { User } from "../../domain/entities/user.entity";
import { UserEntity } from "./user.entity";
import { Email, Phone } from "../../domain/value-objects";
import { UserRole } from "../../domain/enums";

/**
 * Mapper для преобразования между доменной моделью User и TypeORM Entity
 * Ответственность: Data mapping между слоями Domain и Infrastructure
 */
export class UserMapper {
  /**
   * Преобразование из TypeORM Entity в доменную модель
   */
  static toDomain(entity: UserEntity): User {
    const email = entity.email ? Email.create(entity.email) : null;
    const phone = entity.phone ? Phone.create(entity.phone) : null;

    // Преобразуем строковое значение роли в enum
    let role: UserRole;
    switch (entity.role) {
      case 'admin':
        role = UserRole.ADMIN;
        break;
      case 'manager':
        role = UserRole.MANAGER;
        break;
      case 'worker':
        role = UserRole.WORKER;
        break;
      case 'client':
        role = UserRole.CLIENT;
        break;
      default:
        // Если роль не распознана, используем CLIENT как fallback
        role = UserRole.CLIENT;
        console.warn(`Неизвестная роль пользователя: ${entity.role}. Установлена роль CLIENT.`);
    }

    return User.restore({
      id: entity.id,
      username: entity.username,
      passwordHash: entity.passwordHash,
      role: role,
      fullName: entity.fullName,
      email,
      phone,
      isActive: entity.isActive,
      isDeleted: entity.isDeleted,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      lastLoginAt: entity.lastLoginAt,
    });
  }

  /**
   * Преобразование из доменной модели в TypeORM Entity
   */
  static toPersistence(domain: User): UserEntity {
    const entity = new UserEntity();
    
    const id = domain.getId();
    if (id !== undefined) {
      entity.id = id;
    }

    entity.username = domain.getUsername();
    entity.passwordHash = domain.getPasswordHash();
    entity.role = domain.getRole();
    entity.fullName = domain.getFullName();
    entity.email = domain.getEmail()?.getValue() ?? null;
    entity.phone = domain.getPhone()?.getValue() ?? null;
    entity.isActive = domain.getIsActive();
    entity.isDeleted = domain.getIsDeleted();
    entity.createdAt = domain.getCreatedAt();
    entity.updatedAt = domain.getUpdatedAt();
    entity.lastLoginAt = domain.getLastLoginAt();

    return entity;
  }

  /**
   * Преобразование массива entities в массив доменных моделей
   */
  static toDomainList(entities: UserEntity[]): User[] {
    return entities.map((entity) => this.toDomain(entity));
  }
}


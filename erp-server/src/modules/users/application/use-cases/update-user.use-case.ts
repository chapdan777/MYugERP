import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { User } from '../../domain/entities/user.entity';
import { Email, Phone } from '../../domain/value-objects';
import { UserRole } from '../../domain/enums';

/**
 * DTO для обновления профиля пользователя
 */
export interface UpdateUserProfileDto {
  fullName?: string;
  email?: string;
  phone?: string;
}

/**
 * Use Case: Обновление профиля пользователя
 */
@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: number, dto: UpdateUserProfileDto): Promise<User> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }

    // Проверка уникальности email (если меняется)
    if (dto.email && dto.email !== user.getEmail()?.getValue()) {
      const emailExists = await this.userRepository.existsByEmail(dto.email);
      if (emailExists) {
        throw new ConflictException(`Email "${dto.email}" уже используется`);
      }
    }

    // Создание Value Objects
    const email = dto.email !== undefined ? (dto.email ? Email.create(dto.email) : undefined) : undefined;
    const phone = dto.phone !== undefined ? (dto.phone ? Phone.create(dto.phone) : undefined) : undefined;

    // Обновление доменной сущности
    user.updateProfile({
      fullName: dto.fullName,
      email,
      phone: phone === null ? undefined : phone,
    });

    // Сохранение в БД
    return this.userRepository.save(user);
  }
}

/**
 * Use Case: Изменение роли пользователя
 */
@Injectable()
export class ChangeUserRoleUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: number, newRole: UserRole): Promise<User> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }

    user.changeRole(newRole);
    
    return this.userRepository.save(user);
  }
}

/**
 * Use Case: Деактивация пользователя
 */
@Injectable()
export class DeactivateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }

    user.deactivate();
    
    return this.userRepository.save(user);
  }
}

/**
 * Use Case: Активация пользователя
 */
@Injectable()
export class ActivateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }

    user.activate();
    
    return this.userRepository.save(user);
  }
}

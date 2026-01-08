import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { User } from '../../domain/entities/user.entity';
import { Email, Phone } from '../../domain/value-objects';
import { UserRole } from '../../domain/enums';
import * as bcrypt from 'bcrypt';

/**
 * DTO для создания пользователя
 */
export interface CreateUserDto {
  username: string;
  password: string;
  role: UserRole;
  fullName?: string;
  email?: string;
  phone?: string;
}

/**
 * Use Case: Создание нового пользователя
 * Инкапсулирует бизнес-логику создания пользователя
 */
@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    // Проверка уникальности username
    const usernameExists = await this.userRepository.existsByUsername(dto.username);
    if (usernameExists) {
      throw new ConflictException(`Пользователь с username "${dto.username}" уже существует`);
    }

    // Проверка уникальности email (если указан)
    if (dto.email) {
      const emailExists = await this.userRepository.existsByEmail(dto.email);
      if (emailExists) {
        throw new ConflictException(`Пользователь с email "${dto.email}" уже существует`);
      }
    }

    // Хеширование пароля
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Создание Value Objects
    const email = dto.email ? Email.create(dto.email) : null;
    const phone = dto.phone ? Phone.create(dto.phone) : null;

    // Создание доменной сущности
    const user = User.create({
      username: dto.username,
      passwordHash,
      role: dto.role,
      fullName: dto.fullName,
      email,
      phone,
    });

    // Сохранение в БД
    return this.userRepository.save(user);
  }
}

import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { User } from '../../domain/entities/user.entity';

/**
 * Use Case: Получение пользователя по ID
 */
@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }

    return user;
  }
}

/**
 * Use Case: Получение пользователя по username
 */
@Injectable()
export class GetUserByUsernameUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(username: string): Promise<User> {
    const user = await this.userRepository.findByUsername(username);
    
    if (!user) {
      throw new NotFoundException(`Пользователь "${username}" не найден`);
    }

    return user;
  }
}

/**
 * Use Case: Получение всех активных пользователей
 */
@Injectable()
export class GetAllActiveUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(): Promise<User[]> {
    return this.userRepository.findAllActive();
  }
}

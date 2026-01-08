import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { User } from '../../domain/entities/user.entity';

/**
 * Use Case: Мягкое удаление пользователя
 */
@Injectable()
export class SoftDeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }

    user.softDelete();
    
    return this.userRepository.save(user);
  }
}

/**
 * Use Case: Восстановление удаленного пользователя
 */
@Injectable()
export class RestoreUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }

    user.restore();
    
    return this.userRepository.save(user);
  }
}

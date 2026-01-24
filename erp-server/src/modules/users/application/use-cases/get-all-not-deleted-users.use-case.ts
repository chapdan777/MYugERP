/**
 * Use Case: Получение всех неудаленных пользователей
 * Возвращает всех пользователей, у которых isDeleted = false (включая активных и неактивных)
 */

import { Injectable, Inject } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/repositories/injection-tokens';

@Injectable()
export class GetAllNotDeletedUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(): Promise<User[]> {
    // Получаем всех пользователей, у которых isDeleted = false
    // Это включает и активных (isActive = true), и неактивных (isActive = false) пользователей
    const allUsers = await this.userRepository.findAll();
    return allUsers.filter(user => !user.getIsDeleted());
  }
}
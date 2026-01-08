import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './infrastructure/persistence/user.entity';
import { UserRepository } from './infrastructure/persistence/user.repository';
import { USER_REPOSITORY } from './domain/repositories/injection-tokens';

// Use Cases
import {
  CreateUserUseCase,
  GetUserByIdUseCase,
  GetUserByUsernameUseCase,
  GetAllActiveUsersUseCase,
  UpdateUserProfileUseCase,
  ChangeUserRoleUseCase,
  DeactivateUserUseCase,
  ActivateUserUseCase,
  SoftDeleteUserUseCase,
  RestoreUserUseCase,
} from './application/use-cases';

// Controllers
import { UsersController } from './presentation/controllers/users.controller';

/**
 * Модуль управления пользователями
 * Clean Architecture: Domain + Application + Infrastructure + Presentation layers
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [
    // Repository
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    // Use Cases
    CreateUserUseCase,
    GetUserByIdUseCase,
    GetUserByUsernameUseCase,
    GetAllActiveUsersUseCase,
    UpdateUserProfileUseCase,
    ChangeUserRoleUseCase,
    DeactivateUserUseCase,
    ActivateUserUseCase,
    SoftDeleteUserUseCase,
    RestoreUserUseCase,
  ],
  controllers: [UsersController],
  exports: [
    // Экспортируем use cases для использования в других модулях
    CreateUserUseCase,
    GetUserByIdUseCase,
    GetUserByUsernameUseCase,
    GetAllActiveUsersUseCase,
    UpdateUserProfileUseCase,
    ChangeUserRoleUseCase,
    DeactivateUserUseCase,
    ActivateUserUseCase,
    SoftDeleteUserUseCase,
    RestoreUserUseCase,
    USER_REPOSITORY,
  ],
})
export class UsersModule {}

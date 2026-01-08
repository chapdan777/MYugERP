import { IsOptional, IsString, IsEmail, IsEnum } from 'class-validator';
import { UserRole } from '../../domain/enums';

/**
 * DTO для обновления профиля пользователя
 */
export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Невалидный формат email' })
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

/**
 * DTO для изменения роли пользователя
 */
export class ChangeUserRoleDto {
  @IsEnum(UserRole, { message: 'Невалидная роль' })
  role!: UserRole;
}

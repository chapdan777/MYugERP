import { IsNotEmpty, IsString, IsEnum, IsOptional, IsEmail, MinLength } from 'class-validator';
import { UserRole } from '../../domain/enums';

/**
 * DTO для создания пользователя через REST API
 */
export class CreateUserDto {
  @IsNotEmpty({ message: 'Username обязателен' })
  @IsString()
  @MinLength(3, { message: 'Username должен содержать минимум 3 символа' })
  username!: string;

  @IsNotEmpty({ message: 'Пароль обязателен' })
  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password!: string;

  @IsNotEmpty({ message: 'Роль обязательна' })
  @IsEnum(UserRole, { message: 'Невалидная роль' })
  role!: UserRole;

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

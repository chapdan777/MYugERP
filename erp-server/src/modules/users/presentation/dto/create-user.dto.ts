import { IsNotEmpty, IsString, IsEnum, IsOptional, IsEmail, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../domain/enums';

/**
 * DTO для создания пользователя через REST API
 */
export class CreateUserDto {
  @ApiProperty({ 
    description: 'Имя пользователя', 
    example: 'john_doe',
    minLength: 3 
  })
  @IsNotEmpty({ message: 'Username обязателен' })
  @IsString()
  @MinLength(3, { message: 'Username должен содержать минимум 3 символа' })
  username!: string;

  @ApiProperty({ 
    description: 'Пароль пользователя', 
    example: 'password123',
    minLength: 6 
  })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password!: string;

  @ApiProperty({ 
    description: 'Роль пользователя', 
    enum: UserRole,
    example: UserRole.ADMIN
  })
  @IsNotEmpty({ message: 'Роль обязательна' })
  @IsEnum(UserRole, { message: 'Невалидная роль' })
  role!: UserRole;

  @ApiPropertyOptional({ 
    description: 'Полное имя пользователя', 
    example: 'John Doe'
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ 
    description: 'Email пользователя', 
    example: 'john@example.com'
  })
  @IsOptional()
  @IsEmail({}, { message: 'Невалидный формат email' })
  email?: string;

  @ApiPropertyOptional({ 
    description: 'Номер телефона', 
    example: '+79991234567'
  })
  @IsOptional()
  @IsString()
  phone?: string;
}

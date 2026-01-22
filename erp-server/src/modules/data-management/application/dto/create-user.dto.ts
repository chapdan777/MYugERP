/**
 * @file DTO для создания пользователя
 * @description Содержит поля для создания нового пользователя с различными ролями
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

/**
 * Перечисление ролей пользователя
 */
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  CUSTOMER = 'customer',
}

/**
 * DTO для создания пользователя
 */
export class CreateUserDto {
  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Иван Петров',
  })
  @IsString()
  @IsNotEmpty()
  readonly fullName: string;

  @ApiProperty({
    description: 'Email пользователя',
    example: 'ivan.petrov@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: 'securePassword123',
  })
  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @ApiProperty({
    description: 'Роль пользователя',
    enum: UserRole,
    example: UserRole.MANAGER,
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  readonly role: UserRole;

  @ApiProperty({
    description: 'Дополнительные данные пользователя',
    example: { department: 'продажи', phone: '+79991234567' },
    required: false,
  })
  @IsOptional()
  readonly metadata?: Record<string, any>;

  constructor(
    fullName: string,
    email: string,
    password: string,
    role: UserRole,
    metadata?: Record<string, any>,
  ) {
    this.fullName = fullName;
    this.email = email;
    this.password = password;
    this.role = role;
    this.metadata = metadata;
  }
}
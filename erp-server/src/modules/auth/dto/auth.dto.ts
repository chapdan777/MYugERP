import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * DTO для логина пользователя
 */
export class LoginDto {
  @IsNotEmpty({ message: 'Имя пользователя обязательно' })
  @IsString()
  username!: string;

  @IsNotEmpty({ message: 'Пароль обязателен' })
  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password!: string;
}

/**
 * DTO для обновления токена
 */
export class RefreshTokenDto {
  @IsNotEmpty({ message: 'Refresh token обязателен' })
  @IsString()
  refreshToken!: string;
}

/**
 * Response DTO для успешной аутентификации
 */
export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
    role: string;
  };
}

/**
 * Response DTO для обновления access токена
 */
export interface RefreshResponseDto {
  accessToken: string;
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './strategies/jwt.strategy';
import { RefreshTokenPayload } from './strategies/jwt-refresh.strategy';

/**
 * Токены аутентификации
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Сервис для работы с аутентификацией
 * Отвечает за генерацию токенов, валидацию паролей и обновление токенов
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Валидация пользователя по username и password
   * TODO: Реализовать после создания User модуля
   */
  async validateUser(_username: string, _password: string): Promise<any> {
    // Заглушка - будет заменена на реальную логику после создания User модуля
    // const user = await this.userRepository.findByUsername(username);
    // if (user && await bcrypt.compare(password, user.passwordHash)) {
    //   return user;
    // }
    throw new UnauthorizedException('Неверные учетные данные');
  }

  /**
   * Генерация пары токенов (access + refresh)
   */
  async generateTokens(userId: number, username: string, role: string): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(userId, username, role),
      this.generateRefreshToken(userId, username),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Генерация Access токена
   */
  private async generateAccessToken(
    userId: number,
    username: string,
    role: string,
  ): Promise<string> {
    const payload: JwtPayload = {
      sub: userId,
      username,
      role,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
    });
  }

  /**
   * Генерация Refresh токена
   */
  private async generateRefreshToken(
    userId: number,
    username: string,
  ): Promise<string> {
    const payload: RefreshTokenPayload = {
      sub: userId,
      username,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });
  }

  /**
   * Обновление access токена через refresh token
   * TODO: Добавить хранение refresh токенов в БД для отзыва
   */
  async refreshAccessToken(userId: number, username: string, role: string): Promise<string> {
    return this.generateAccessToken(userId, username, role);
  }

  /**
   * Хеширование пароля
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Проверка пароля
   */
  async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

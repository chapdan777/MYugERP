import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './strategies/jwt.strategy';
import { RefreshTokenPayload } from './strategies/jwt-refresh.strategy';
import { GetUserByUsernameUseCase, GetUserByIdUseCase } from '../users/application/use-cases/get-user.use-case';
import { User } from '../users/domain/entities/user.entity';

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
    private readonly getUserByUsernameUseCase: GetUserByUsernameUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
  ) { }

  /**
   * Валидация пользователя по username и password
   */
  async validateUser(username: string, password: string): Promise<User | null> {
    try {
      const user = await this.getUserByUsernameUseCase.execute(username);

      if (user && await this.comparePasswords(password, user.getPasswordHash())) {
        return user;
      }
    } catch (error) {
      // If user not found, return null
      if (error instanceof NotFoundException) {
        return null;
      }
      throw error;
    }

    return null;
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
    // Note: Refresh token usually contains only sub and username (and maybe version/tokenId)
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
   */
  async refreshAccessToken(userId: number, username: string): Promise<string> {
    const user = await this.getUserByIdUseCase.execute(userId);

    if (!user || user.getUsername() !== username) {
      throw new UnauthorizedException('Невалидный токен');
    }

    if (!user.canLogin()) {
      throw new UnauthorizedException('Учетная запись деактивирована');
    }

    return this.generateAccessToken(userId, user.getUsername(), user.getRole());
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

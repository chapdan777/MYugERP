import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

/**
 * Refresh Token Payload структура
 */
export interface RefreshTokenPayload {
  sub: number; // User ID
  username: string;
  iat?: number;
  exp?: number;
}

/**
 * Стратегия для проверки JWT Refresh токенов
 * Используется для обновления Access токена через refresh token
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.refreshSecret'),
      passReqToCallback: true, // Передаем req в метод validate
    });
  }

  /**
   * Метод вызывается после успешной валидации Refresh токена
   * Возвращаемый объект будет доступен в request.user
   */
  async validate(
    req: Request,
    payload: RefreshTokenPayload,
  ): Promise<RefreshTokenPayload & { refreshToken: string }> {
    if (!payload.sub || !payload.username) {
      throw new UnauthorizedException('Невалидный refresh токен');
    }

    // Извлекаем refresh token из заголовка для дальнейшей валидации
    const refreshToken = req.get('Authorization')?.replace('Bearer ', '').trim();

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh токен не найден');
    }

    return {
      sub: payload.sub,
      username: payload.username,
      refreshToken,
    };
  }
}

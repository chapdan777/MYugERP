import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * JWT Payload структура
 */
export interface JwtPayload {
  sub: number; // User ID
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Стратегия для проверки JWT Access токенов
 * Используется для аутентификации пользователей на защищенных endpoint'ах
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  /**
   * Метод вызывается после успешной валидации JWT токена
   * Возвращаемый объект будет доступен в request.user
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (!payload.sub || !payload.username || !payload.role) {
      throw new UnauthorizedException('Невалидный токен');
    }

    return {
      sub: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}

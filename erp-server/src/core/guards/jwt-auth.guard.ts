import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';

/**
 * JWT Authentication Guard
 * Проверяет наличие и валидность JWT токена в запросе
 * Используется для защиты эндпоинтов, требующих аутентификации
 * Пропускает endpoints помеченные декоратором @Public()
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Проверяем, помечен ли эндпоинт как публичный
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // Если публичный, пропускаем без проверки
      return true;
    }

    // Вызываем родительский метод из Passport для проверки JWT
    return super.canActivate(context);
  }
}

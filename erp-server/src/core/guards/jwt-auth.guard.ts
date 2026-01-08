import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * JWT Authentication Guard
 * Проверяет наличие и валидность JWT токена в запросе
 * Используется для защиты эндпоинтов, требующих аутентификации
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Вызываем родительский метод из Passport
    return super.canActivate(context);
  }
}

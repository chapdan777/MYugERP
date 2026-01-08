import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';

/**
 * Role-Based Access Control (RBAC) Guard
 * Проверяет, что пользователь имеет необходимую роль для доступа к эндпоинту
 * Работает в связке с декоратором @Roles()
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Получаем требуемые роли из метаданных эндпоинта
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Если роли не указаны, доступ разрешен
    if (!requiredRoles) {
      return true;
    }

    // Получаем пользователя из запроса (добавлен JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    // Проверяем, есть ли у пользователя хотя бы одна из требуемых ролей
    return requiredRoles.some((role) => user?.role === role);
  }
}

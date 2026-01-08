import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CreateAuditLogUseCase } from '../../application/use-cases/create-audit-log.use-case';

/**
 * Interceptor для автоматического логирования действий пользователей
 * Фиксирует HTTP метод, путь, пользователя, результат
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly createAuditLogUseCase: CreateAuditLogUseCase,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Из JWT guard
    const method = request.method;
    const url = request.url;
    const body = request.body;
    const ip = request.ip || request.connection.remoteAddress;
    const userAgent = request.get('user-agent') || '';

    // Пропускаем логирование для определенных путей
    if (this.shouldSkipLogging(url)) {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (response) => {
          // Логируем успешное действие
          this.logAction(
            user,
            method,
            url,
            body,
            response,
            ip,
            userAgent,
            Date.now() - startTime,
            'success',
          );
        },
        error: (error) => {
          // Логируем ошибку
          this.logAction(
            user,
            method,
            url,
            body,
            error,
            ip,
            userAgent,
            Date.now() - startTime,
            'error',
          );
        },
      }),
    );
  }

  private shouldSkipLogging(url: string): boolean {
    // Не логируем health check, метрики и т.д.
    const skipPaths = [
      '/health',
      '/metrics',
      '/favicon.ico',
      '/auth/refresh', // Слишком частый endpoint
    ];
    return skipPaths.some((path) => url.startsWith(path));
  }

  private async logAction(
    user: any,
    method: string,
    url: string,
    body: any,
    result: any,
    ip: string,
    userAgent: string,
    duration: number,
    status: 'success' | 'error',
  ): Promise<void> {
    try {
      // Определяем тип действия на основе метода и URL
      const action = this.deriveAction(method, url, status);
      const entityType = this.extractEntityType(url);
      const entityId = this.extractEntityId(url);

      // Подготавливаем изменения (без чувствительных данных)
      const changes = this.sanitizeChanges({
        method,
        url,
        body: this.sanitizeBody(body),
        result: status === 'error' ? result.message : undefined,
        duration,
        status,
      });

      await this.createAuditLogUseCase.execute({
        userId: user?.id || 0, // 0 для анонимных запросов
        username: user?.username || 'anonymous',
        action,
        entityType,
        entityId: entityId !== null ? entityId : undefined,
        changes,
        ipAddress: ip,
        userAgent,
      });
    } catch (error) {
      // Не прерываем основной поток при ошибке логирования
      console.error('Failed to create audit log:', error);
    }
  }

  private deriveAction(method: string, _url: string, status: string): string {
    const prefix = status === 'error' ? 'FAILED_' : '';
    
    if (method === 'POST') return `${prefix}CREATE`;
    if (method === 'PUT' || method === 'PATCH') return `${prefix}UPDATE`;
    if (method === 'DELETE') return `${prefix}DELETE`;
    if (method === 'GET') return `${prefix}READ`;
    
    return `${prefix}${method}`;
  }

  private extractEntityType(url: string): string {
    // Извлекаем тип сущности из URL
    // Например: /api/users/123 -> users
    const parts = url.split('/').filter(Boolean);
    if (parts.length > 0) {
      // Берем первую часть после /api (если есть)
      const apiIndex = parts.findIndex(p => p === 'api');
      if (apiIndex !== -1 && parts.length > apiIndex + 1) {
        return parts[apiIndex + 1];
      }
      return parts[0];
    }
    return 'unknown';
  }

  private extractEntityId(url: string): string | null {
    // Извлекаем ID из URL
    // Например: /api/users/123 -> 123
    const parts = url.split('/').filter(Boolean);
    // Ищем числовой параметр
    for (const part of parts) {
      if (/^\d+$/.test(part)) {
        return part;
      }
    }
    return null;
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    // Удаляем чувствительные поля
    const sensitiveFields = ['password', 'passwordHash', 'token', 'refreshToken', 'accessToken'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  private sanitizeChanges(changes: any): Record<string, any> {
    // Убираем undefined значения
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(changes)) {
      if (value !== undefined) {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}

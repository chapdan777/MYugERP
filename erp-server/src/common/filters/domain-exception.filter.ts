import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Базовый класс для доменных исключений
 * Наследуйте от него для создания специфичных доменных ошибок
 */
export class DomainException extends Error {
  constructor(
    message: string,
    public readonly details?: any,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Исключение при нарушении бизнес-правил
 */
export class BusinessRuleViolationException extends DomainException {
  constructor(message: string, details?: any) {
    super(message, details);
  }
}

/**
 * Исключение при нарушении инвариантов сущности
 */
export class InvariantViolationException extends DomainException {
  constructor(message: string, details?: any) {
    super(message, details);
  }
}

/**
 * Исключение когда сущность не найдена
 */
export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, id: any) {
    super(`${entityName} с ID ${id} не найден`);
  }
}

/**
 * Фильтр для обработки доменных исключений
 * Преобразует доменные ошибки в HTTP ответы с соответствующими статусами
 */
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // Определяем HTTP статус на основе типа доменного исключения
    let status = HttpStatus.BAD_REQUEST;

    if (exception instanceof EntityNotFoundException) {
      status = HttpStatus.NOT_FOUND;
    } else if (
      exception instanceof BusinessRuleViolationException ||
      exception instanceof InvariantViolationException
    ) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
    }

    // Формируем ответ
    const errorResponse = {
      statusCode: status,
      error: exception.name,
      message: exception.message,
      details: exception.details,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}

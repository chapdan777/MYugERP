import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Интерфейс ответа об ошибке
 */
interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string | string[];
  details?: any;
  timestamp: string;
  path: string;
}

/**
 * Глобальный фильтр для обработки HTTP исключений
 * Преобразует все ошибки в единый формат ответа
 * Логирует ошибки для мониторинга
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Определяем статус и сообщение ошибки
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Внутренняя ошибка сервера';
    let error = 'InternalServerError';
    let details: any;

    if (exception instanceof HttpException) {
      // HTTP исключение от NestJS
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as any;
        message = resp.message || message;
        error = resp.error || exception.name;
        details = resp.details;
      }
    } else if (exception instanceof Error) {
      // Обычная ошибка JavaScript
      message = exception.message;
      error = exception.name;

      // Логируем стек трейс для внутренних ошибок
      this.logger.error(
        `Необработанное исключение: ${exception.message}`,
        exception.stack,
      );
    } else {
      // Неизвестный тип ошибки
      this.logger.error('Неизвестное исключение:', exception);
    }

    // Формируем ответ
    const errorResponse: ErrorResponse = {
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Добавляем детали только если они есть
    if (details) {
      errorResponse.details = details;
    }

    // Логируем ошибку
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${JSON.stringify(errorResponse)}`,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} - ${status} - ${message}`,
      );
    }

    // Отправляем ответ
    response.status(status).json(errorResponse);
  }
}

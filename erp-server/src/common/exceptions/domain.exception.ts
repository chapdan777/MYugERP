import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Domain Exception - для ошибок доменного слоя
 * Используется когда нарушаются инварианты или бизнес-правила
 */
export class DomainException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

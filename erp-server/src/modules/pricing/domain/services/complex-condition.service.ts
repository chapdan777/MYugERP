import { Injectable } from '@nestjs/common';
import { ConditionParserService } from './condition-parser.service';
import { ConditionEvaluatorService } from './condition-evaluator.service';
import { DomainException } from '../../../../common/exceptions/domain.exception';
import { ConditionEvaluationContext } from '../types/condition.types';

/**
 * Сервис для работы со сложными условиями фильтрации
 * Объединяет парсинг и вычисление условий
 */
@Injectable()
export class ComplexConditionService {
  constructor(
    private readonly parser: ConditionParserService,
    private readonly evaluator: ConditionEvaluatorService,
  ) {
    // ParseResult и EvaluationResult используются в сигнатурах методов
    // parser.parse() и evaluator.evaluate()
  }

  /**
   * Проверяет, удовлетворяет ли набор свойств условию
   */
  isConditionMet(
    conditionExpression: string,
    propertyValues: Map<number, string>,
    currentDate: Date = new Date(),
  ): boolean {
    // Парсим выражение
    const parseResult = this.parser.parse(conditionExpression);
    
    if (!parseResult.success) {
      throw new DomainException(
        `Ошибка парсинга условия: ${parseResult.error}`,
      );
    }

    if (!parseResult.ast) {
      throw new DomainException('AST не был создан');
    }

    // Оцениваем условие
    const context: ConditionEvaluationContext = {
      propertyValues,
      currentDate,
    };

    const evaluationResult = this.evaluator.evaluate(parseResult.ast, context);

    if (!evaluationResult.success) {
      throw new DomainException(
        `Ошибка вычисления условия: ${evaluationResult.error}`,
      );
    }

    return evaluationResult.value ?? false;
  }

  /**
   * Валидирует синтаксис выражения условия без выполнения
   */
  validateConditionSyntax(conditionExpression: string): boolean {
    const result = this.parser.parse(conditionExpression);
    return result.success;
  }

  /**
   * Получает детали ошибки парсинга
   */
  getParseError(conditionExpression: string): string | null {
    const result = this.parser.parse(conditionExpression);
    return result.error ?? null;
  }

  /**
   * Тестовый метод для проверки различных условий
   * Используется для демонстрации возможностей
   */
  testCondition(
    conditionExpression: string,
    propertyValues: Map<number, string>,
  ): { isValid: boolean; result?: boolean; error?: string } {
    try {
      const isValid = this.validateConditionSyntax(conditionExpression);
      
      if (!isValid) {
        const error = this.getParseError(conditionExpression);
        return {
          isValid: false,
          error: error || 'Неизвестная синтаксическая ошибка',
        };
      }

      const result = this.isConditionMet(conditionExpression, propertyValues);
      return {
        isValid: true,
        result,
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      };
    }
  }
}
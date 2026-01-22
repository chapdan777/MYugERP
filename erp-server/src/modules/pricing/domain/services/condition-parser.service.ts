import { DomainException } from '../../../../common/exceptions/domain.exception';
import {
  ASTNode,
  ParseResult,
  PropertyRefNode,
  StringLiteralNode,
  NumberLiteralNode,
  BinaryOperationNode,
  UnaryOperationNode,
  InNode,
  BetweenNode,
} from '../types/condition.types';

/**
 * Парсер условий для модификаторов цен
 * Поддерживает SQL-подобный синтаксис:
 * - propertyId = 123 AND propertyValue = 'premium'
 * - propertyId = 456 AND propertyValue LIKE 'color:%'
 * - propertyId = 789 AND propertyValue > 1000
 * - (propertyId = 123 AND propertyValue = 'premium') OR (propertyId = 456 AND propertyValue IN ('red', 'blue'))
 * - propertyId = 789 AND propertyValue BETWEEN 1000 AND 5000
 */
export class ConditionParserService {
  private position: number = 0;
  private input: string = '';

  parse(expression: string): ParseResult {
    try {
      this.input = expression.trim();
      this.position = 0;

      if (!this.input) {
        return {
          success: false,
          error: 'Пустое выражение условия',
        };
      }

      const ast = this.parseExpression();
      
      // Проверяем, что весь вход был_consumed
      this.skipWhitespace();
      if (this.position < this.input.length) {
        return {
          success: false,
          error: `Неожиданные символы в конце выражения: ${this.input.substring(this.position)}`,
        };
      }

      return {
        success: true,
        ast,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка парсинга',
      };
    }
  }

  private parseExpression(): ASTNode {
    return this.parseOrExpression();
  }

  private parseOrExpression(): ASTNode {
    let left = this.parseAndExpression();

    this.skipWhitespace();
    while (this.match('OR')) {
      this.consume('OR');
      const right = this.parseAndExpression();
      left = {
        type: 'OR',
        left,
        right,
      } as BinaryOperationNode;
      this.skipWhitespace();
    }

    return left;
  }

  private parseAndExpression(): ASTNode {
    let left = this.parseComparison();

    this.skipWhitespace();
    while (this.match('AND')) {
      this.consume('AND');
      const right = this.parseComparison();
      left = {
        type: 'AND',
        left,
        right,
      } as BinaryOperationNode;
      this.skipWhitespace();
    }

    return left;
  }

  private parseComparison(): ASTNode {
    // Проверяем NOT
    if (this.match('NOT')) {
      this.consume('NOT');
      this.skipWhitespace();
      const operand = this.parseComparison();
      return {
        type: 'NOT',
        operand,
      } as UnaryOperationNode;
    }

    // Парсим левую часть
    const left = this.parseTerm();

    this.skipWhitespace();

    // Проверяем операторы
    if (this.match('=')) {
      this.consume('=');
      const right = this.parseTerm();
      return {
        type: 'EQUALS',
        left,
        right,
      } as BinaryOperationNode;
    }

    if (this.match('!=')) {
      this.consume('!=');
      const right = this.parseTerm();
      return {
        type: 'NOT_EQUALS',
        left,
        right,
      } as BinaryOperationNode;
    }

    if (this.match('>=')) {
      this.consume('>=');
      const right = this.parseTerm();
      return {
        type: 'GREATER_EQUAL',
        left,
        right,
      } as BinaryOperationNode;
    }

    if (this.match('<=')) {
      this.consume('<=');
      const right = this.parseTerm();
      return {
        type: 'LESS_EQUAL',
        left,
        right,
      } as BinaryOperationNode;
    }

    if (this.match('>')) {
      this.consume('>');
      const right = this.parseTerm();
      return {
        type: 'GREATER_THAN',
        left,
        right,
      } as BinaryOperationNode;
    }

    if (this.match('<')) {
      this.consume('<');
      const right = this.parseTerm();
      return {
        type: 'LESS_THAN',
        left,
        right,
      } as BinaryOperationNode;
    }

    if (this.matchCaseInsensitive('LIKE')) {
      this.consumeCaseInsensitive('LIKE');
      const right = this.parseTerm();
      return {
        type: 'LIKE',
        left,
        right,
      } as BinaryOperationNode;
    }

    if (this.matchCaseInsensitive('IN')) {
      this.consumeCaseInsensitive('IN');
      this.skipWhitespace();
      this.consume('(');
      
      const values: ASTNode[] = [];
      do {
        this.skipWhitespace();
        values.push(this.parseTerm());
        this.skipWhitespace();
      } while (this.match(',') && (this.consume(','), true));

      this.skipWhitespace();
      this.consume(')');

      return {
        type: 'IN',
        property: left,
        values,
      } as InNode;
    }

    if (this.matchCaseInsensitive('BETWEEN')) {
      this.consumeCaseInsensitive('BETWEEN');
      const min = this.parseTerm();
      this.skipWhitespace();
      this.consumeCaseInsensitive('AND');
      const max = this.parseTerm();

      return {
        type: 'BETWEEN',
        property: left,
        min,
        max,
      } as BetweenNode;
    }

    return left;
  }

  private parseTerm(): ASTNode {
    this.skipWhitespace();

    // Property reference: propertyId или propertyValue
    if (this.matchIdentifier()) {
      const identifier = this.consumeIdentifier();
      
      if (identifier === 'propertyId' || identifier === 'propertyValue') {
        // Это ссылка на свойство
        return {
          type: 'PROPERTY_REF',
          propertyId: identifier === 'propertyId' ? 0 : 0, // Будет определено позже
        } as PropertyRefNode;
      }

      throw new DomainException(`Неизвестный идентификатор: ${identifier}`);
    }

    // Числовые литералы
    if (this.matchNumber()) {
      const num = this.consumeNumber();
      return {
        type: 'NUMBER_LITERAL',
        value: num,
      } as NumberLiteralNode;
    }

    // Строковые литералы
    if (this.match("'") || this.match('"')) {
      const str = this.consumeString();
      return {
        type: 'STRING_LITERAL',
        value: str,
      } as StringLiteralNode;
    }

    // Группировка скобками
    if (this.match('(')) {
      this.consume('(');
      const expr = this.parseExpression();
      this.consume(')');
      return expr;
    }

    throw new DomainException(`Неожиданный токен: ${this.peek()}`);
  }

  private skipWhitespace(): void {
    while (this.position < this.input.length && /\s/.test(this.input[this.position])) {
      this.position++;
    }
  }

  private peek(): string {
    return this.position < this.input.length ? this.input[this.position] : '';
  }

  private match(expected: string): boolean {
    return this.input.startsWith(expected, this.position);
  }

  private matchCaseInsensitive(expected: string): boolean {
    return this.input.substring(this.position, this.position + expected.length).toLowerCase() === expected.toLowerCase();
  }

  private matchIdentifier(): boolean {
    const remaining = this.input.substring(this.position);
    return /^[a-zA-Z_][a-zA-Z0-9_]*/.test(remaining);
  }

  private matchNumber(): boolean {
    const remaining = this.input.substring(this.position);
    return /^-?\d+(\.\d+)?/.test(remaining);
  }

  private consume(expected: string): void {
    if (!this.match(expected)) {
      throw new DomainException(`Ожидался '${expected}', но найдено '${this.peek()}'`);
    }
    this.position += expected.length;
  }

  private consumeCaseInsensitive(expected: string): void {
    if (!this.matchCaseInsensitive(expected)) {
      const actual = this.input.substring(this.position, this.position + expected.length);
      throw new DomainException(`Ожидался '${expected}', но найдено '${actual}'`);
    }
    this.position += expected.length;
  }

  private consumeIdentifier(): string {
    const match = this.input.substring(this.position).match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
    if (!match) {
      throw new DomainException('Ожидался идентификатор');
    }
    const identifier = match[0];
    this.position += identifier.length;
    return identifier;
  }

  private consumeNumber(): number {
    const match = this.input.substring(this.position).match(/^-?\d+(\.\d+)?/);
    if (!match) {
      throw new DomainException('Ожидался числовой литерал');
    }
    const numStr = match[0];
    this.position += numStr.length;
    return parseFloat(numStr);
  }

  private consumeString(): string {
    const quote = this.peek();
    if (quote !== "'" && quote !== '"') {
      throw new DomainException('Ожидались кавычки');
    }
    
    this.position++; // Пропускаем открывающую кавычку
    
    let result = '';
    while (this.position < this.input.length && this.peek() !== quote) {
      if (this.peek() === '\\') {
        this.position++; // Пропускаем escape символ
        if (this.position < this.input.length) {
          result += this.peek();
        }
      } else {
        result += this.peek();
      }
      this.position++;
    }
    
    if (this.position >= this.input.length) {
      throw new DomainException('Незакрытая строка');
    }
    
    this.position++; // Пропускаем закрывающую кавычку
    return result;
  }
}
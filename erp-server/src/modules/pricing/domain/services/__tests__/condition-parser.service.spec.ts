import { ConditionParserService } from '../condition-parser.service';
import { ParseResult } from '../../types/condition.types';

describe('ConditionParserService', () => {
  let parser: ConditionParserService;

  beforeEach(() => {
    parser = new ConditionParserService();
  });

  describe('Basic parsing', () => {
    it('should parse simple equality condition', () => {
      const result = parser.parse("propertyId = 123");
      
      expect(result.success).toBe(true);
      expect(result.ast).toBeDefined();
      expect(result.ast?.type).toBe('EQUALS');
    });

    it('should parse string equality condition', () => {
      const result = parser.parse("propertyValue = 'premium'");
      
      expect(result.success).toBe(true);
      expect(result.ast).toBeDefined();
      expect(result.ast?.type).toBe('EQUALS');
    });

    it('should parse numeric comparison', () => {
      const result = parser.parse("propertyValue > 1000");
      
      expect(result.success).toBe(true);
      expect(result.ast).toBeDefined();
      expect(result.ast?.type).toBe('GREATER_THAN');
    });

    it('should parse LIKE condition', () => {
      const result = parser.parse("propertyValue LIKE 'color:%'");
      
      expect(result.success).toBe(true);
      expect(result.ast).toBeDefined();
      expect(result.ast?.type).toBe('LIKE');
    });
  });

  describe('Logical operations', () => {
    it('should parse AND conditions', () => {
      const result = parser.parse("propertyId = 123 AND propertyValue = 'premium'");
      
      expect(result.success).toBe(true);
      expect(result.ast).toBeDefined();
      expect(result.ast?.type).toBe('AND');
    });

    it('should parse OR conditions', () => {
      const result = parser.parse("propertyId = 123 OR propertyId = 456");
      
      expect(result.success).toBe(true);
      expect(result.ast).toBeDefined();
      expect(result.ast?.type).toBe('OR');
    });

    it('should parse NOT conditions', () => {
      const result = parser.parse("NOT propertyId = 123");
      
      expect(result.success).toBe(true);
      expect(result.ast).toBeDefined();
      expect(result.ast?.type).toBe('NOT');
    });

    it('should parse complex logical expressions', () => {
      const result = parser.parse("(propertyId = 123 AND propertyValue = 'premium') OR (propertyId = 456 AND propertyValue = 'standard')");
      
      expect(result.success).toBe(true);
      expect(result.ast).toBeDefined();
      expect(result.ast?.type).toBe('OR');
    });
  });

  describe('Advanced operators', () => {
    it('should parse IN condition', () => {
      const result = parser.parse("propertyValue IN ('red', 'blue', 'green')");
      
      expect(result.success).toBe(true);
      expect(result.ast).toBeDefined();
      expect(result.ast?.type).toBe('IN');
    });

    it('should parse BETWEEN condition', () => {
      const result = parser.parse("propertyValue BETWEEN 1000 AND 5000");
      
      expect(result.success).toBe(true);
      expect(result.ast).toBeDefined();
      expect(result.ast?.type).toBe('BETWEEN');
    });

    it('should parse various comparison operators', () => {
      const operators = ['>=', '<=', '!=', '>', '<'];
      
      operators.forEach(op => {
        const result = parser.parse(`propertyValue ${op} 1000`);
        expect(result.success).toBe(true);
        expect(result.ast).toBeDefined();
      });
    });
  });

  describe('Error handling', () => {
    it('should return error for empty expression', () => {
      const result = parser.parse('');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Пустое выражение');
    });

    it('should return error for invalid syntax', () => {
      const result = parser.parse("propertyId ==");
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error for unclosed string', () => {
      const result = parser.parse("propertyValue = 'unclosed");
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error for unexpected tokens', () => {
      const result = parser.parse("propertyId = 123 $$$");
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle whitespace correctly', () => {
      const expressions = [
        "propertyId=123",
        "propertyId = 123",
        " propertyId   =   123 ",
        "\tpropertyId\t=\t123\t"
      ];
      
      expressions.forEach(expr => {
        const result = parser.parse(expr);
        expect(result.success).toBe(true);
      });
    });

    it('should handle case insensitive operators', () => {
      const result1 = parser.parse("propertyValue like 'test'");
      const result2 = parser.parse("propertyValue LIKE 'test'");
      const result3 = parser.parse("propertyValue Like 'test'");
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result3.success).toBe(true);
    });

    it('should handle parentheses grouping', () => {
      const result = parser.parse("((propertyId = 123))");
      
      expect(result.success).toBe(true);
      expect(result.ast).toBeDefined();
    });
  });
});
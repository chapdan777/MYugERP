import { ComplexConditionService } from '../complex-condition.service';
import { ConditionParserService } from '../condition-parser.service';
import { ConditionEvaluatorService } from '../condition-evaluator.service';

describe('ComplexConditionService', () => {
  let service: ComplexConditionService;
  let parser: ConditionParserService;
  let evaluator: ConditionEvaluatorService;

  beforeEach(() => {
    parser = new ConditionParserService();
    evaluator = new ConditionEvaluatorService();
    service = new ComplexConditionService(parser, evaluator);
  });

  const createPropertyValues = (values: Record<number, string>): Map<number, string> => {
    return new Map(Object.entries(values).map(([k, v]) => [parseInt(k), v]));
  };

  describe('validateConditionSyntax', () => {
    it('should validate correct syntax', () => {
      const result = service.validateConditionSyntax("propertyId = 123");
      expect(result).toBe(true);
    });

    it('should reject invalid syntax', () => {
      const result = service.validateConditionSyntax("propertyId ==");
      expect(result).toBe(false);
    });

    it('should validate complex expressions', () => {
      const expressions = [
        "propertyId = 123 AND propertyValue = 'premium'",
        "(propertyId = 123 OR propertyId = 456) AND propertyValue LIKE 'color:%'",
        "propertyValue BETWEEN 1000 AND 5000",
        "propertyValue IN ('red', 'blue', 'green')"
      ];

      expressions.forEach(expr => {
        const result = service.validateConditionSyntax(expr);
        expect(result).toBe(true);
      });
    });
  });

  describe('getParseError', () => {
    it('should return null for valid expressions', () => {
      const error = service.getParseError("propertyId = 123");
      expect(error).toBeNull();
    });

    it('should return error message for invalid expressions', () => {
      const error = service.getParseError("propertyId ==");
      expect(error).toBeDefined();
      expect(typeof error).toBe('string');
    });
  });

  describe('testCondition', () => {
    it('should test valid condition successfully', () => {
      const propertyValues = createPropertyValues({ 123: 'premium' });
      const result = service.testCondition("propertyId = 123", propertyValues);
      
      expect(result.isValid).toBe(true);
      expect(result.result).toBeDefined();
    });

    it('should return validation error for invalid syntax', () => {
      const propertyValues = createPropertyValues({});
      const result = service.testCondition("propertyId ==", propertyValues);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should test various condition types', () => {
      const propertyValues = createPropertyValues({ 1: 'test' });
      const conditions = [
        "propertyId = 1",
        "propertyValue = 'test'",
        "propertyId = 1 AND propertyValue = 'test'",
        "propertyValue LIKE 'te%'"
      ];

      conditions.forEach(condition => {
        const result = service.testCondition(condition, propertyValues);
        expect(result.isValid).toBe(true);
        expect(result.result).toBeDefined();
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should handle realistic pricing conditions', () => {
      const propertyValues = createPropertyValues({
        1: 'facade',
        2: 'premium',
        3: 'wood',
        4: 'red'
      });

      const conditions = [
        "propertyId = 1 AND propertyValue = 'facade'", // Basic product type
        "propertyValue = 'premium'", // Premium model
        "propertyId = 3 AND propertyValue = 'wood'", // Wood material
        "(propertyId = 1 AND propertyValue = 'facade') AND (propertyValue = 'premium')" // Complex combination
      ];

      conditions.forEach(condition => {
        const result = service.testCondition(condition, propertyValues);
        expect(result.isValid).toBe(true);
        expect(result.result).toBeDefined();
      });
    });

    it('should handle edge cases gracefully', () => {
      // Пустые значения свойств для первого теста
      const emptyPropertyValues = createPropertyValues({});
      const result1 = service.testCondition("propertyId = 123", emptyPropertyValues);
      expect(result1.isValid).toBe(true);

      // Значения свойств для комплексного условия
      const propertyValues = createPropertyValues({
        1: 'A',
        2: 'B',
        3: 'X'  // Добавляем значение из списка IN
      });

      // Complex condition without NOT operator
      const complexCondition = "((propertyId = 1 AND propertyValue = 'A') OR (propertyId = 2 AND propertyValue = 'B')) AND propertyValue IN ('X', 'Y', 'Z')";
      
      const result2 = service.testCondition(complexCondition, propertyValues);
      expect(result2.isValid).toBe(true);
    });
  });
});
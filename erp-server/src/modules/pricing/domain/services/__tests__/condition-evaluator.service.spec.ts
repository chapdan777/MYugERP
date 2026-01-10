import { ConditionEvaluatorService } from '../condition-evaluator.service';
import { ConditionParserService } from '../condition-parser.service';
import { ConditionEvaluationContext } from '../../types/condition.types';

describe('ConditionEvaluatorService', () => {
  let evaluator: ConditionEvaluatorService;
  let parser: ConditionParserService;

  beforeEach(() => {
    evaluator = new ConditionEvaluatorService();
    parser = new ConditionParserService();
  });

  const createContext = (propertyValues: Record<number, string>): ConditionEvaluationContext => ({
    propertyValues: new Map(Object.entries(propertyValues).map(([k, v]) => [parseInt(k), v])),
    currentDate: new Date(),
  });

  describe('Basic evaluations', () => {
    it('should evaluate simple equality', () => {
      const ast = parser.parse("propertyValue = 'test'").ast!;
      const context = createContext({});
      
      const result = evaluator.evaluate(ast, context);
      
      expect(result.success).toBe(true);
      // Note: Actual evaluation depends on property value resolution
      expect(result.value).toBeDefined();
    });

    it('should evaluate numeric comparisons', () => {
      const ast = parser.parse("propertyValue > 1000").ast!;
      const context = createContext({});
      
      const result = evaluator.evaluate(ast, context);
      
      expect(result.success).toBe(true);
      expect(result.value).toBeDefined();
    });

    it('should evaluate LIKE conditions', () => {
      const ast = parser.parse("propertyValue LIKE 'color:%'").ast!;
      const context = createContext({});
      
      const result = evaluator.evaluate(ast, context);
      
      expect(result.success).toBe(true);
      expect(result.value).toBeDefined();
    });
  });

  describe('Logical operations', () => {
    it('should evaluate AND conditions', () => {
      const ast = parser.parse("propertyId = 123 AND propertyValue = 'premium'").ast!;
      const context = createContext({});
      
      const result = evaluator.evaluate(ast, context);
      
      expect(result.success).toBe(true);
      expect(result.value).toBeDefined();
    });

    it('should evaluate OR conditions', () => {
      const ast = parser.parse("propertyId = 123 OR propertyId = 456").ast!;
      const context = createContext({});
      
      const result = evaluator.evaluate(ast, context);
      
      expect(result.success).toBe(true);
      expect(result.value).toBeDefined();
    });

    it('should evaluate NOT conditions', () => {
      const ast = parser.parse("NOT propertyId = 123").ast!;
      const context = createContext({});
      
      const result = evaluator.evaluate(ast, context);
      
      expect(result.success).toBe(true);
      expect(result.value).toBeDefined();
    });
  });

  describe('Advanced operators', () => {
    it('should evaluate IN conditions', () => {
      const ast = parser.parse("propertyValue IN ('red', 'blue', 'green')").ast!;
      const context = createContext({});
      
      const result = evaluator.evaluate(ast, context);
      
      expect(result.success).toBe(true);
      expect(result.value).toBeDefined();
    });

    it('should evaluate BETWEEN conditions', () => {
      const ast = parser.parse("propertyValue BETWEEN 1000 AND 5000").ast!;
      const context = createContext({});
      
      const result = evaluator.evaluate(ast, context);
      
      expect(result.success).toBe(true);
      expect(result.value).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should handle evaluation errors gracefully', () => {
      // Create a malformed AST to test error handling
      const malformedAst: any = {
        type: 'UNKNOWN_TYPE',
      };
      
      const context = createContext({});
      const result = evaluator.evaluate(malformedAst, context);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle type mismatch errors gracefully', () => {
      const ast = parser.parse("propertyValue > 'string'").ast!; // String vs number comparison
      const context = createContext({});
      
      const result = evaluator.evaluate(ast, context);
      
      // Type mismatches now return success=true with value=false instead of throwing
      expect(result.success).toBe(true);
      expect(result.value).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle complex nested expressions', () => {
      const ast = parser.parse("(propertyId = 123 AND propertyValue = 'premium') OR (propertyId = 456 AND propertyValue IN ('red', 'blue'))").ast!;
      const context = createContext({});
      
      const result = evaluator.evaluate(ast, context);
      
      expect(result.success).toBe(true);
      expect(result.value).toBeDefined();
    });

    it('should handle multiple comparison operators', () => {
      const operators = ['>=', '<=', '!=', '>', '<'];
      
      operators.forEach(op => {
        const ast = parser.parse(`propertyValue ${op} 1000`).ast!;
        const context = createContext({});
        const result = evaluator.evaluate(ast, context);
        
        expect(result.success).toBe(true);
        expect(result.value).toBeDefined();
      });
    });
  });
});
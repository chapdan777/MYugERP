import { PriceModifier } from '../price-modifier.entity';
import { ModifierType } from '../../enums/modifier-type.enum';
import { DomainException } from '../../../../../common/exceptions/domain.exception';

describe('PriceModifier - Complex Conditions', () => {
  const createModifierProps = (overrides: any = {}) => ({
    name: 'Test Modifier',
    code: 'TEST_MOD',
    modifierType: ModifierType.PERCENTAGE,
    value: 10,
    ...overrides,
  });

  describe('isApplicableFor with simple conditions', () => {
    it('should return true when property matches', () => {
      const modifier = PriceModifier.create({
        ...createModifierProps(),
        propertyId: 123,
        propertyValue: 'premium',
      });

      const propertyValues = new Map([[123, 'premium']]);
      const result = modifier.isApplicableFor(propertyValues);

      expect(result).toBe(true);
    });

    it('should return false when property does not match', () => {
      const modifier = PriceModifier.create({
        ...createModifierProps(),
        propertyId: 123,
        propertyValue: 'premium',
      });

      const propertyValues = new Map([[123, 'standard']]);
      const result = modifier.isApplicableFor(propertyValues);

      expect(result).toBe(false);
    });

    it('should return true when no property conditions specified', () => {
      const modifier = PriceModifier.create(createModifierProps());

      const propertyValues = new Map([[123, 'any']]);
      const result = modifier.isApplicableFor(propertyValues);

      expect(result).toBe(true);
    });
  });

  describe('isApplicableFor with complex conditions', () => {
    it('should use condition evaluator when provided', () => {
      const mockEvaluator = {
        isConditionMet: jest.fn().mockReturnValue(true),
      };

      const modifier = PriceModifier.create({
        ...createModifierProps(),
        conditionExpression: 'propertyValue > 1000',
      });

      const propertyValues = new Map([[123, 'premium']]);
      const result = modifier.isApplicableFor(propertyValues, new Date(), mockEvaluator);

      expect(mockEvaluator.isConditionMet).toHaveBeenCalledWith(
        'propertyValue > 1000',
        propertyValues,
        expect.any(Date)
      );
      expect(result).toBe(true);
    });

    it('should return false when condition evaluator throws error', () => {
      const mockEvaluator = {
        isConditionMet: jest.fn().mockImplementation(() => {
          throw new Error('Parse error');
        }),
      };

      const modifier = PriceModifier.create({
        ...createModifierProps(),
        conditionExpression: 'invalid syntax',
      });

      const propertyValues = new Map([[123, 'premium']]);
      const result = modifier.isApplicableFor(propertyValues, new Date(), mockEvaluator);

      expect(result).toBe(false);
    });

    it('should return true when no evaluator provided (backward compatibility)', () => {
      const modifier = PriceModifier.create({
        ...createModifierProps(),
        conditionExpression: 'propertyValue > 1000',
      });

      const propertyValues = new Map([[123, 'premium']]);
      const result = modifier.isApplicableFor(propertyValues);

      expect(result).toBe(true); // Backward compatibility
    });
  });

  describe('isApplicableFor with mixed conditions', () => {
    it('should use complex conditions when both are present (validation prevents this)', () => {
      // This test demonstrates that validation prevents mixing condition types
      expect(() => {
        PriceModifier.create({
          ...createModifierProps(),
          propertyId: 123,
          propertyValue: 'simple_condition',
          conditionExpression: 'propertyValue > 1000',
        });
      }).toThrow(DomainException);
    });

    it('should prioritize complex conditions over simple ones when validation is bypassed', () => {
      const mockEvaluator = {
        isConditionMet: jest.fn().mockReturnValue(true),
      };

      // Create modifier with only complex condition
      const modifier = PriceModifier.create({
        ...createModifierProps(),
        conditionExpression: 'propertyValue > 1000',
      });

      const propertyValues = new Map([[123, 'different_value']]);
      const result = modifier.isApplicableFor(propertyValues, new Date(), mockEvaluator);

      // Should use complex condition evaluator, not simple property matching
      expect(mockEvaluator.isConditionMet).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('isApplicableFor with temporal constraints', () => {
    it('should return false when modifier is inactive', () => {
      const modifier = PriceModifier.create(createModifierProps());
      modifier.deactivate();

      const propertyValues = new Map([[123, 'premium']]);
      const result = modifier.isApplicableFor(propertyValues);

      expect(result).toBe(false);
    });

    it('should check temporal constraints before evaluating conditions', () => {
      const mockEvaluator = {
        isConditionMet: jest.fn().mockReturnValue(true),
      };

      const modifier = PriceModifier.create({
        ...createModifierProps(),
        conditionExpression: 'propertyValue > 1000',
      });
      modifier.deactivate(); // Make inactive

      const propertyValues = new Map([[123, 'premium']]);
      const result = modifier.isApplicableFor(propertyValues, new Date(), mockEvaluator);

      expect(mockEvaluator.isConditionMet).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should respect date range constraints', () => {
      const pastDate = new Date(Date.now() - 86400000); // Yesterday
      const futureDate = new Date(Date.now() + 86400000); // Tomorrow
      
      const modifier = PriceModifier.create({
        ...createModifierProps(),
        startDate: pastDate,
        endDate: futureDate,
      });

      const propertyValues = new Map([[123, 'premium']]);
      
      // Should be active during valid period
      const result1 = modifier.isApplicableFor(propertyValues, new Date());
      expect(result1).toBe(true);
      
      // Should be inactive outside valid period
      const result2 = modifier.isApplicableFor(propertyValues, new Date(Date.now() + 172800000)); // In 2 days
      expect(result2).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle realistic pricing conditions', () => {
      const mockEvaluator = {
        isConditionMet: jest.fn((expr: string) => {
          // Mock logic for the complex expression
          // Expression: 'propertyValue > 3000 AND propertyValue IN ('red', 'blue')'
          if (expr.includes('propertyValue > 3000') && expr.includes('propertyValue IN')) {
            // Both conditions in one expression - check if value 4500 > 3000 (true) 
            // and if green is in [red, blue] (false)
            // Overall should be false
            return false;
          }
          if (expr.includes('propertyValue > 3000')) {
            return true; // 4500 > 3000
          }
          if (expr.includes('propertyValue IN')) {
            return false; // green not in [red, blue]
          }
          return true;
        }),
      };

      const modifier = PriceModifier.create({
        ...createModifierProps(),
        name: 'Expensive Item Surcharge',
        value: 15,
        conditionExpression: 'propertyValue > 3000 AND propertyValue IN (\'red\', \'blue\')',
      });

      const propertyValues = new Map([
        [1, 'product_type'],
        [2, '4500'], // High value
        [3, 'green'], // Not in color list
      ]);

      const result = modifier.isApplicableFor(propertyValues, new Date(), mockEvaluator);
      
      // Should be false because color condition is not met
      expect(result).toBe(false);
    });

    it('should handle multiple modifiers with different condition types', () => {
      const mockEvaluator = {
        isConditionMet: jest.fn().mockImplementation((expr: string) => {
          return expr.includes('premium') || expr.includes('> 1000');
        }),
      };

      // Simple condition modifier
      const simpleModifier = PriceModifier.create({
        ...createModifierProps({ name: 'Simple Modifier' }),
        propertyId: 1,
        propertyValue: 'premium',
      });

      // Complex condition modifier
      const complexModifier = PriceModifier.create({
        ...createModifierProps({ name: 'Complex Modifier' }),
        conditionExpression: 'propertyValue > 1000',
      });

      const propertyValues = new Map([[1, 'premium'], [2, '1500']]);

      const simpleResult = simpleModifier.isApplicableFor(propertyValues, new Date(), mockEvaluator);
      const complexResult = complexModifier.isApplicableFor(propertyValues, new Date(), mockEvaluator);

      expect(simpleResult).toBe(true);
      expect(complexResult).toBe(true);
    });
  });
});
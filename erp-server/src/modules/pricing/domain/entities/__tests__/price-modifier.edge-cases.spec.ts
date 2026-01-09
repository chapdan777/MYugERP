import { PriceModifier } from '../price-modifier.entity';
import { ModifierType } from '../../enums/modifier-type.enum';
import { DomainException } from '../../../../../common/exceptions/domain.exception';

describe('PriceModifier Edge Cases', () => {
  describe('boundary values', () => {
    it('should handle zero values correctly', () => {
      // Zero percentage (no change)
      const zeroPercent = PriceModifier.create({
        name: 'Zero Percent',
        code: 'ZERO_PERCENT',
        modifierType: ModifierType.PERCENTAGE,
        value: 0,
      });
      expect(zeroPercent.getValue()).toBe(0);

      // Zero fixed amount (no additional cost)
      const zeroAmount = PriceModifier.create({
        name: 'Zero Amount',
        code: 'ZERO_AMOUNT',
        modifierType: ModifierType.FIXED_AMOUNT,
        value: 0,
      });
      expect(zeroAmount.getValue()).toBe(0);

      // Zero multiplier (would make everything free, but valid)
      const zeroMultiplier = PriceModifier.create({
        name: 'Zero Multiplier',
        code: 'ZERO_MULTIPLIER',
        modifierType: ModifierType.MULTIPLIER,
        value: 0,
      });
      expect(zeroMultiplier.getValue()).toBe(0);
    });

    it('should handle maximum values', () => {
      // Maximum reasonable percentage (100% increase)
      const maxPercent = PriceModifier.create({
        name: 'Max Percent',
        code: 'MAX_PERCENT',
        modifierType: ModifierType.PERCENTAGE,
        value: 100,
      });
      expect(maxPercent.getValue()).toBe(100);

      // Large fixed amount
      const largeAmount = PriceModifier.create({
        name: 'Large Amount',
        code: 'LARGE_AMOUNT',
        modifierType: ModifierType.FIXED_AMOUNT,
        value: 999999.9999,
      });
      expect(largeAmount.getValue()).toBe(999999.9999);
    });

    it('should handle minimum values', () => {
      // Minimum percentage (-100% discount - free item)
      const minPercent = PriceModifier.create({
        name: 'Min Percent',
        code: 'MIN_PERCENT',
        modifierType: ModifierType.PERCENTAGE,
        value: -100,
      });
      expect(minPercent.getValue()).toBe(-100);

      // Very small positive values
      const smallValue = PriceModifier.create({
        name: 'Small Value',
        code: 'SMALL_VALUE',
        modifierType: ModifierType.FIXED_AMOUNT,
        value: 0.0001,
      });
      expect(smallValue.getValue()).toBe(0.0001);
    });
  });

  describe('property binding edge cases', () => {
    it('should handle modifiers with same property but different values', () => {
      const whiteModifier = PriceModifier.create({
        name: 'White Color',
        code: 'COLOR_WHITE',
        modifierType: ModifierType.FIXED_AMOUNT,
        value: 50,
        propertyId: 1,
        propertyValue: 'white',
      });

      const blackModifier = PriceModifier.create({
        name: 'Black Color',
        code: 'COLOR_BLACK',
        modifierType: ModifierType.FIXED_AMOUNT,
        value: 75,
        propertyId: 1,
        propertyValue: 'black',
      });

      const propertyValues = new Map<number, string>();
      propertyValues.set(1, 'white');

      expect(whiteModifier.isApplicableFor(propertyValues)).toBe(true);
      expect(blackModifier.isApplicableFor(propertyValues)).toBe(false);
    });

    it('should handle modifiers with numeric property values', () => {
      const numericModifier = PriceModifier.create({
        name: 'Numeric Property',
        code: 'NUMERIC_PROP',
        modifierType: ModifierType.PERCENTAGE,
        value: 15,
        propertyId: 10,
        propertyValue: '123',
      });

      const propertyValues = new Map<number, string>();
      propertyValues.set(10, '123');

      expect(numericModifier.isApplicableFor(propertyValues)).toBe(true);
    });

    it('should handle modifiers with special characters in property values', () => {
      const specialCharModifier = PriceModifier.create({
        name: 'Special Characters',
        code: 'SPECIAL_CHARS',
        modifierType: ModifierType.FIXED_AMOUNT,
        value: 100,
        propertyId: 5,
        propertyValue: 'color:white/glossy',
      });

      const propertyValues = new Map<number, string>();
      propertyValues.set(5, 'color:white/glossy');

      expect(specialCharModifier.isApplicableFor(propertyValues)).toBe(true);
    });
  });

  describe('priority edge cases', () => {
    it('should handle same priority modifiers', () => {
      const modifier1 = PriceModifier.create({
        name: 'Same Priority 1',
        code: 'SAME_PRIORITY_1',
        modifierType: ModifierType.PERCENTAGE,
        value: 10,
        priority: 5,
      });

      const modifier2 = PriceModifier.create({
        name: 'Same Priority 2',
        code: 'SAME_PRIORITY_2',
        modifierType: ModifierType.FIXED_AMOUNT,
        value: 50,
        priority: 5,
      });

      // Both should be valid with same priority
      expect(modifier1.getPriority()).toBe(5);
      expect(modifier2.getPriority()).toBe(5);
    });

    it('should handle very high priority values', () => {
      const highPriority = PriceModifier.create({
        name: 'High Priority',
        code: 'HIGH_PRIORITY',
        modifierType: ModifierType.PERCENTAGE,
        value: 20,
        priority: 999999,
      });

      expect(highPriority.getPriority()).toBe(999999);
    });

    it('should handle zero priority', () => {
      const zeroPriority = PriceModifier.create({
        name: 'Zero Priority',
        code: 'ZERO_PRIORITY',
        modifierType: ModifierType.FIXED_AMOUNT,
        value: 25,
        priority: 0,
      });

      expect(zeroPriority.getPriority()).toBe(0);
    });
  });

  describe('business rule violations', () => {
    it('should reject invalid combinations', () => {
      // Property ID without value
      expect(() => {
        PriceModifier.create({
          name: 'Invalid Combo',
          code: 'INVALID_COMBO',
          modifierType: ModifierType.PERCENTAGE,
          value: 10,
          propertyId: 1,
          propertyValue: null,
        });
      }).toThrow(DomainException);

      // Empty strings
      expect(() => {
        PriceModifier.create({
          name: '   ', // Only spaces
          code: 'VALID_CODE',
          modifierType: ModifierType.PERCENTAGE,
          value: 10,
        });
      }).toThrow(DomainException);
    });

    it('should handle modifier type validation', () => {
      // Test that each modifier type validates correctly
      const validTypes = [
        { type: ModifierType.PERCENTAGE, value: 10 },
        { type: ModifierType.FIXED_PRICE, value: 1000 },
        { type: ModifierType.PER_UNIT, value: 25.50 },
        { type: ModifierType.MULTIPLIER, value: 1.25 },
        { type: ModifierType.FIXED_AMOUNT, value: -50 }, // Can be negative
      ];

      validTypes.forEach(({ type, value }) => {
        const modifier = PriceModifier.create({
          name: `${type} Modifier`,
          code: `${type}_TEST`,
          modifierType: type,
          value: value,
        });
        expect(modifier.getModifierType()).toBe(type);
        expect(modifier.getValue()).toBe(value);
      });
    });
  });

  describe('concurrent operations simulation', () => {
    it('should handle rapid updates gracefully', () => {
      const modifier = PriceModifier.create({
        name: 'Concurrent Test',
        code: 'CONCURRENT_TEST',
        modifierType: ModifierType.PERCENTAGE,
        value: 10,
        priority: 1,
      });

      // Simulate rapid updates
      modifier.updateInfo({ value: 15 });
      modifier.updateInfo({ priority: 2 });
      modifier.updateInfo({ name: 'Updated Concurrent Test' });

      expect(modifier.getValue()).toBe(15);
      expect(modifier.getPriority()).toBe(2);
      expect(modifier.getName()).toBe('Updated Concurrent Test');
    });

    it('should maintain consistency after multiple operations', () => {
      const modifier = PriceModifier.create({
        name: 'Consistency Test',
        code: 'CONSISTENCY_TEST',
        modifierType: ModifierType.FIXED_AMOUNT,
        value: 100,
      });

      // Perform various operations
      modifier.updateInfo({ value: 200 });
      modifier.deactivate();
      modifier.activate();
      modifier.updateInfo({ priority: 10 });

      // Final state should be consistent
      expect(modifier.getIsActive()).toBe(true);
      expect(modifier.getValue()).toBe(200);
      expect(modifier.getPriority()).toBe(10);
    });
  });

  describe('data integrity', () => {
    it('should preserve all data through serialization cycle', () => {
      const original = PriceModifier.create({
        name: 'Serialization Test',
        code: 'SERIALIZE_TEST',
        modifierType: ModifierType.MULTIPLIER,
        value: 1.5,
        propertyId: 1,
        propertyValue: 'premium',
        priority: 3,
      });

      // Simulate storing and restoring
      const restored = PriceModifier.restore({
        id: original.getId() || 1,
        name: original.getName(),
        code: original.getCode(),
        modifierType: original.getModifierType(),
        value: original.getValue(),
        propertyId: original.getPropertyId(),
        propertyValue: original.getPropertyValue(),
        priority: original.getPriority(),
        isActive: original.getIsActive(),
        createdAt: original.getCreatedAt(),
        updatedAt: original.getUpdatedAt(),
      });

      expect(restored.getName()).toBe(original.getName());
      expect(restored.getCode()).toBe(original.getCode());
      expect(restored.getModifierType()).toBe(original.getModifierType());
      expect(restored.getValue()).toBe(original.getValue());
      expect(restored.getPropertyId()).toBe(original.getPropertyId());
      expect(restored.getPropertyValue()).toBe(original.getPropertyValue());
      expect(restored.getPriority()).toBe(original.getPriority());
      expect(restored.getIsActive()).toBe(original.getIsActive());
    });

    it('should handle edge case property combinations', () => {
      // Null property ID with null value (global modifier)
      const globalModifier = PriceModifier.create({
        name: 'Global Modifier',
        code: 'GLOBAL_MOD',
        modifierType: ModifierType.PERCENTAGE,
        value: 5,
        propertyId: null,
        propertyValue: null,
      });

      expect(globalModifier.getPropertyId()).toBeNull();
      expect(globalModifier.getPropertyValue()).toBeNull();
      expect(globalModifier.isApplicableFor(new Map())).toBe(true);

      // Both property ID and value present
      const specificModifier = PriceModifier.create({
        name: 'Specific Modifier',
        code: 'SPECIFIC_MOD',
        modifierType: ModifierType.FIXED_AMOUNT,
        value: 75,
        propertyId: 1,
        propertyValue: 'specific_value',
      });

      expect(specificModifier.getPropertyId()).toBe(1);
      expect(specificModifier.getPropertyValue()).toBe('specific_value');
    });
  });
});
import { PriceModifier } from '../price-modifier.entity';
import { ModifierType } from '../../enums/modifier-type.enum';

describe('PriceModifier Temporal Logic', () => {
  describe('isCurrentlyActive', () => {
    it('should return true for permanent active modifier', () => {
      const modifier = PriceModifier.create({
        name: 'Permanent Modifier',
        code: 'PERMANENT_001',
        modifierType: ModifierType.PERCENTAGE,
        value: 10,
      });

      expect(modifier.isCurrentlyActive()).toBe(true);
    });

    it('should return false for inactive modifier', () => {
      const modifier = PriceModifier.create({
        name: 'Inactive Modifier',
        code: 'INACTIVE_001',
        modifierType: ModifierType.FIXED_AMOUNT,
        value: 50,
      });

      modifier.deactivate();
      expect(modifier.isCurrentlyActive()).toBe(false);
    });

    it('should handle modifier with future start date', () => {
      const futureDate = new Date(Date.now() + 86400000); // Tomorrow
      const modifier = PriceModifier.create({
        name: 'Future Modifier',
        code: 'FUTURE_001',
        modifierType: ModifierType.PERCENTAGE,
        value: 15,
        startDate: futureDate,
      });

      expect(modifier.isCurrentlyActive()).toBe(false);
      expect(modifier.isCurrentlyActive(futureDate)).toBe(true);
    });

    it('should handle modifier with past end date', () => {
      const pastDate = new Date(Date.now() - 86400000); // Yesterday
      const modifier = PriceModifier.create({
        name: 'Expired Modifier',
        code: 'EXPIRED_001',
        modifierType: ModifierType.FIXED_AMOUNT,
        value: 75,
        endDate: pastDate,
      });

      expect(modifier.isCurrentlyActive()).toBe(false);
      expect(modifier.isCurrentlyActive(pastDate)).toBe(true);
    });

    it('should handle modifier with both start and end dates', () => {
      const startDate = new Date(Date.now() - 43200000); // 12 hours ago
      const endDate = new Date(Date.now() + 43200000);   // 12 hours from now

      const modifier = PriceModifier.create({
        name: 'Time-Bounded Modifier',
        code: 'BOUNDED_001',
        modifierType: ModifierType.MULTIPLIER,
        value: 1.2,
        startDate,
        endDate,
      });

      expect(modifier.isCurrentlyActive()).toBe(true);
      expect(modifier.isCurrentlyActive(startDate)).toBe(true);
      expect(modifier.isCurrentlyActive(endDate)).toBe(true);
      
      // Test outside bounds
      expect(modifier.isCurrentlyActive(new Date(startDate.getTime() - 1000))).toBe(false);
      expect(modifier.isCurrentlyActive(new Date(endDate.getTime() + 1000))).toBe(false);
    });

    it('should handle modifier with start date in past and no end date', () => {
      const pastDate = new Date(Date.now() - 86400000); // Yesterday
      const modifier = PriceModifier.create({
        name: 'Started Modifier',
        code: 'STARTED_001',
        modifierType: ModifierType.PERCENTAGE,
        value: 20,
        startDate: pastDate,
      });

      expect(modifier.isCurrentlyActive()).toBe(true);
    });

    it('should handle modifier with end date in future and no start date', () => {
      const futureDate = new Date(Date.now() + 86400000); // Tomorrow
      const modifier = PriceModifier.create({
        name: 'Ending Modifier',
        code: 'ENDING_001',
        modifierType: ModifierType.FIXED_AMOUNT,
        value: 100,
        endDate: futureDate,
      });

      expect(modifier.isCurrentlyActive()).toBe(true);
    });
  });

  describe('isApplicableFor with temporal logic', () => {
    it('should consider temporal constraints when checking applicability', () => {
      const propertyValues = new Map<number, string>();
      propertyValues.set(1, 'white');

      const futureDate = new Date(Date.now() + 86400000); // Tomorrow
      const modifier = PriceModifier.create({
        name: 'Future Property Modifier',
        code: 'FUTURE_PROP',
        modifierType: ModifierType.FIXED_AMOUNT,
        value: 50,
        propertyId: 1,
        propertyValue: 'white',
        startDate: futureDate,
      });

      // Should not be applicable now
      expect(modifier.isApplicableFor(propertyValues)).toBe(false);
      
      // Should be applicable in the future
      expect(modifier.isApplicableFor(propertyValues, futureDate)).toBe(true);
    });

    it('should combine property and temporal checks', () => {
      const propertyValues = new Map<number, string>();
      propertyValues.set(1, 'black'); // Wrong property value

      const modifier = PriceModifier.create({
        name: 'Combined Check Modifier',
        code: 'COMBINED_001',
        modifierType: ModifierType.PERCENTAGE,
        value: 25,
        propertyId: 1,
        propertyValue: 'white', // Different from provided value
        startDate: new Date(Date.now() - 3600000), // Active now
        endDate: new Date(Date.now() + 3600000),   // Active now
      });

      expect(modifier.isApplicableFor(propertyValues)).toBe(false);
    });
  });

  describe('temporal validation', () => {
    it('should reject start date after end date', () => {
      const startDate = new Date(Date.now() + 86400000);  // Tomorrow
      const endDate = new Date(Date.now() - 86400000);    // Yesterday

      expect(() => {
        PriceModifier.create({
          name: 'Invalid Dates',
          code: 'INVALID_DATES',
          modifierType: ModifierType.PERCENTAGE,
          value: 10,
          startDate,
          endDate,
        });
      }).toThrow('Дата начала не может быть позже даты окончания');
    });

    it('should accept valid temporal combinations', () => {
      // Only start date
      const modifier1 = PriceModifier.create({
        name: 'Start Only',
        code: 'START_ONLY',
        modifierType: ModifierType.FIXED_AMOUNT,
        value: 50,
        startDate: new Date(Date.now() + 3600000),
      });
      expect(modifier1.getStartDate()).toBeDefined();

      // Only end date
      const modifier2 = PriceModifier.create({
        name: 'End Only',
        code: 'END_ONLY',
        modifierType: ModifierType.MULTIPLIER,
        value: 1.5,
        endDate: new Date(Date.now() + 86400000),
      });
      expect(modifier2.getEndDate()).toBeDefined();

      // Both dates in correct order
      const modifier3 = PriceModifier.create({
        name: 'Both Dates',
        code: 'BOTH_DATES',
        modifierType: ModifierType.PERCENTAGE,
        value: 20,
        startDate: new Date(Date.now() - 3600000),
        endDate: new Date(Date.now() + 3600000),
      });
      expect(modifier3.getStartDate()).toBeDefined();
      expect(modifier3.getEndDate()).toBeDefined();
    });
  });

  describe('updateInfo with temporal fields', () => {
    let modifier: PriceModifier;

    beforeEach(() => {
      modifier = PriceModifier.create({
        name: 'Update Test',
        code: 'UPDATE_TEMPORAL',
        modifierType: ModifierType.PERCENTAGE,
        value: 10,
      });
    });

    it('should update start date', () => {
      const newStartDate = new Date(Date.now() + 86400000);
      modifier.updateInfo({ startDate: newStartDate });
      expect(modifier.getStartDate()).toEqual(newStartDate);
    });

    it('should update end date', () => {
      const newEndDate = new Date(Date.now() + 172800000);
      modifier.updateInfo({ endDate: newEndDate });
      expect(modifier.getEndDate()).toEqual(newEndDate);
    });

    it('should update both temporal fields', () => {
      const startDate = new Date(Date.now() + 3600000);
      const endDate = new Date(Date.now() + 7200000);
      
      modifier.updateInfo({ startDate, endDate });
      expect(modifier.getStartDate()).toEqual(startDate);
      expect(modifier.getEndDate()).toEqual(endDate);
    });

    it('should clear temporal fields when set to null', () => {
      // Set initial values
      modifier.updateInfo({
        startDate: new Date(Date.now() + 3600000),
        endDate: new Date(Date.now() + 7200000),
      });

      // Clear them
      modifier.updateInfo({ startDate: null, endDate: null });
      expect(modifier.getStartDate()).toBeNull();
      expect(modifier.getEndDate()).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle exact boundary dates', () => {
      const now = new Date();
      const modifier = PriceModifier.create({
        name: 'Boundary Test',
        code: 'BOUNDARY_001',
        modifierType: ModifierType.FIXED_AMOUNT,
        value: 100,
        startDate: now,
        endDate: now,
      });

      expect(modifier.isCurrentlyActive(now)).toBe(true);
    });

    it('should handle millisecond precision', () => {
      const preciseDate = new Date('2026-01-09T12:00:00.123Z');
      const modifier = PriceModifier.create({
        name: 'Precision Test',
        code: 'PRECISION_001',
        modifierType: ModifierType.PERCENTAGE,
        value: 15,
        startDate: preciseDate,
        endDate: new Date(preciseDate.getTime() + 1000),
      });

      expect(modifier.isCurrentlyActive(preciseDate)).toBe(true);
      expect(modifier.isCurrentlyActive(new Date(preciseDate.getTime() + 500))).toBe(true);
      expect(modifier.isCurrentlyActive(new Date(preciseDate.getTime() + 1001))).toBe(false);
    });
  });
});
import { PriceModifier } from '../price-modifier.entity';
import { ModifierType } from '../../enums/modifier-type.enum';
import { DomainException } from '../../../../../common/exceptions/domain.exception';

// Enable fake timers for timestamp testing
jest.useFakeTimers();

describe('PriceModifier', () => {
  describe('create', () => {
    it('should create a valid price modifier', () => {
      const modifier = PriceModifier.create({
        name: 'Test Modifier',
        code: 'TEST_001',
        modifierType: ModifierType.PERCENTAGE,
        value: 10,
        priority: 1,
      });

      expect(modifier.getName()).toBe('Test Modifier');
      expect(modifier.getCode()).toBe('TEST_001');
      expect(modifier.getModifierType()).toBe(ModifierType.PERCENTAGE);
      expect(modifier.getValue()).toBe(10);
      expect(modifier.getPriority()).toBe(1);
      expect(modifier.getIsActive()).toBe(true);
    });

    it('should create modifier with property binding', () => {
      const modifier = PriceModifier.create({
        name: 'Color White Modifier',
        code: 'COLOR_WHITE',
        modifierType: ModifierType.FIXED_AMOUNT,
        value: 50,
        propertyId: 1,
        propertyValue: 'white',
        priority: 2,
      });

      expect(modifier.getPropertyId()).toBe(1);
      expect(modifier.getPropertyValue()).toBe('white');
    });

    it('should create modifier with default values', () => {
      const modifier = PriceModifier.create({
        name: 'Simple Modifier',
        code: 'SIMPLE_001',
        modifierType: ModifierType.MULTIPLIER,
        value: 1.2,
      });

      expect(modifier.getPriority()).toBe(0);
      expect(modifier.getPropertyId()).toBeNull();
      expect(modifier.getPropertyValue()).toBeNull();
    });
  });

  describe('restore', () => {
    it('should restore modifier from database data', () => {
      const now = new Date();
      const modifier = PriceModifier.restore({
        id: 1,
        name: 'Restored Modifier',
        code: 'RESTORED_001',
        modifierType: ModifierType.FIXED_PRICE,
        value: 1000,
        propertyId: null,
        propertyValue: null,
        priority: 5,
        isActive: false,
        createdAt: now,
        updatedAt: now,
      });

      expect(modifier.getId()).toBe(1);
      expect(modifier.getName()).toBe('Restored Modifier');
      expect(modifier.getIsActive()).toBe(false);
      expect(modifier.getCreatedAt()).toEqual(now);
      expect(modifier.getUpdatedAt()).toEqual(now);
    });
  });

  describe('validation', () => {
    it('should throw error for empty name', () => {
      expect(() => {
        PriceModifier.create({
          name: '',
          code: 'VALID_CODE',
          modifierType: ModifierType.PERCENTAGE,
          value: 10,
        });
      }).toThrow(DomainException);
    });

    it('should throw error for empty code', () => {
      expect(() => {
        PriceModifier.create({
          name: 'Valid Name',
          code: '',
          modifierType: ModifierType.PERCENTAGE,
          value: 10,
        });
      }).toThrow(DomainException);
    });

    it('should throw error for negative priority', () => {
      expect(() => {
        PriceModifier.create({
          name: 'Valid Name',
          code: 'VALID_CODE',
          modifierType: ModifierType.PERCENTAGE,
          value: 10,
          priority: -1,
        });
      }).toThrow(DomainException);
    });

    describe('percentage validation', () => {
      it('should allow positive percentage', () => {
        const modifier = PriceModifier.create({
          name: 'Valid Percentage',
          code: 'PERCENT_001',
          modifierType: ModifierType.PERCENTAGE,
          value: 25,
        });
        expect(modifier.getValue()).toBe(25);
      });

      it('should allow negative percentage (discount)', () => {
        const modifier = PriceModifier.create({
          name: 'Discount Modifier',
          code: 'DISCOUNT_001',
          modifierType: ModifierType.PERCENTAGE,
          value: -15,
        });
        expect(modifier.getValue()).toBe(-15);
      });

      it('should throw error for discount greater than 100%', () => {
        expect(() => {
          PriceModifier.create({
            name: 'Invalid Discount',
            code: 'INVALID_DISCOUNT',
            modifierType: ModifierType.PERCENTAGE,
            value: -150,
          });
        }).toThrow(DomainException);
      });
    });

    describe('fixed price validation', () => {
      it('should allow positive fixed price', () => {
        const modifier = PriceModifier.create({
          name: 'Fixed Price Modifier',
          code: 'FIXED_001',
          modifierType: ModifierType.FIXED_PRICE,
          value: 1500,
        });
        expect(modifier.getValue()).toBe(1500);
      });

      it('should throw error for negative fixed price', () => {
        expect(() => {
          PriceModifier.create({
            name: 'Invalid Fixed Price',
            code: 'INVALID_FIXED',
            modifierType: ModifierType.FIXED_PRICE,
            value: -100,
          });
        }).toThrow(DomainException);
      });
    });

    describe('property binding validation', () => {
      it('should throw error when propertyId provided without propertyValue', () => {
        expect(() => {
          PriceModifier.create({
            name: 'Invalid Property Binding',
            code: 'INVALID_PROP',
            modifierType: ModifierType.PERCENTAGE,
            value: 10,
            propertyId: 1,
            propertyValue: null,
          });
        }).toThrow(DomainException);
      });

      it('should allow modifier without property binding', () => {
        const modifier = PriceModifier.create({
          name: 'Global Modifier',
          code: 'GLOBAL_001',
          modifierType: ModifierType.PERCENTAGE,
          value: 5,
        });
        expect(modifier.getPropertyId()).toBeNull();
        expect(modifier.getPropertyValue()).toBeNull();
      });
    });
  });

  describe('isApplicableFor', () => {
    it('should return true for modifier without property binding', () => {
      const modifier = PriceModifier.create({
        name: 'Global Modifier',
        code: 'GLOBAL_001',
        modifierType: ModifierType.PERCENTAGE,
        value: 10,
      });

      const propertyValues = new Map<number, string>();
      propertyValues.set(1, 'white');
      propertyValues.set(2, 'glossy');

      expect(modifier.isApplicableFor(propertyValues)).toBe(true);
    });

    it('should return true when property matches', () => {
      const modifier = PriceModifier.create({
        name: 'White Color Modifier',
        code: 'WHITE_COLOR',
        modifierType: ModifierType.FIXED_AMOUNT,
        value: 100,
        propertyId: 1,
        propertyValue: 'white',
      });

      const propertyValues = new Map<number, string>();
      propertyValues.set(1, 'white');
      propertyValues.set(2, 'glossy');

      expect(modifier.isApplicableFor(propertyValues)).toBe(true);
    });

    it('should return false when property value does not match', () => {
      const modifier = PriceModifier.create({
        name: 'White Color Modifier',
        code: 'WHITE_COLOR',
        modifierType: ModifierType.FIXED_AMOUNT,
        value: 100,
        propertyId: 1,
        propertyValue: 'white',
      });

      const propertyValues = new Map<number, string>();
      propertyValues.set(1, 'black'); // Different value
      propertyValues.set(2, 'glossy');

      expect(modifier.isApplicableFor(propertyValues)).toBe(false);
    });

    it('should return false when property is not present', () => {
      const modifier = PriceModifier.create({
        name: 'Specific Property Modifier',
        code: 'SPECIFIC_PROP',
        modifierType: ModifierType.PERCENTAGE,
        value: 15,
        propertyId: 3,
        propertyValue: 'premium',
      });

      const propertyValues = new Map<number, string>();
      propertyValues.set(1, 'white');
      propertyValues.set(2, 'glossy');
      // Property 3 is missing

      expect(modifier.isApplicableFor(propertyValues)).toBe(false);
    });
  });

  describe('updateInfo', () => {
    let modifier: PriceModifier;

    beforeEach(() => {
      modifier = PriceModifier.create({
        name: 'Original Modifier',
        code: 'ORIGINAL_001',
        modifierType: ModifierType.PERCENTAGE,
        value: 10,
        priority: 1,
      });
    });

    it('should update name', () => {
      modifier.updateInfo({ name: 'Updated Name' });
      expect(modifier.getName()).toBe('Updated Name');
    });

    it('should update value', () => {
      modifier.updateInfo({ value: 25 });
      expect(modifier.getValue()).toBe(25);
    });

    it('should update property binding', () => {
      modifier.updateInfo({
        propertyId: 1,
        propertyValue: 'red',
      });
      expect(modifier.getPropertyId()).toBe(1);
      expect(modifier.getPropertyValue()).toBe('red');
    });

    it('should update priority', () => {
      modifier.updateInfo({ priority: 5 });
      expect(modifier.getPriority()).toBe(5);
    });

    it('should throw error for negative priority update', () => {
      expect(() => {
        modifier.updateInfo({ priority: -1 });
      }).toThrow(DomainException);
    });

    it('should update multiple fields at once', () => {
      const oldUpdatedAt = modifier.getUpdatedAt();
      
      // Small delay to ensure timestamp difference
      jest.advanceTimersByTime(1);
      
      modifier.updateInfo({
        name: 'Multi Update',
        value: 30,
        priority: 3,
      });

      expect(modifier.getName()).toBe('Multi Update');
      expect(modifier.getValue()).toBe(30);
      expect(modifier.getPriority()).toBe(3);
      expect(modifier.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });
  });

  describe('activation/deactivation', () => {
    let modifier: PriceModifier;

    beforeEach(() => {
      modifier = PriceModifier.create({
        name: 'Test Modifier',
        code: 'TEST_001',
        modifierType: ModifierType.PERCENTAGE,
        value: 10,
      });
    });

    it('should activate inactive modifier', () => {
      // First deactivate it
      modifier.deactivate();
      expect(modifier.getIsActive()).toBe(false);

      // Then activate it
      modifier.activate();
      expect(modifier.getIsActive()).toBe(true);
    });

    it('should deactivate active modifier', () => {
      expect(modifier.getIsActive()).toBe(true);
      modifier.deactivate();
      expect(modifier.getIsActive()).toBe(false);
    });

    it('should throw error when activating already active modifier', () => {
      expect(() => modifier.activate()).toThrow(DomainException);
    });

    it('should throw error when deactivating already inactive modifier', () => {
      modifier.deactivate();
      expect(() => modifier.deactivate()).toThrow(DomainException);
    });

    it('should update timestamps on activation/deactivation', () => {
      const oldUpdatedAt = modifier.getUpdatedAt();
      
      // Small delays to ensure timestamp differences
      jest.advanceTimersByTime(1);
      modifier.deactivate();
      const deactivateTime = modifier.getUpdatedAt();
      expect(deactivateTime.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());

      jest.advanceTimersByTime(1);
      modifier.activate();
      const activateTime = modifier.getUpdatedAt();
      expect(activateTime.getTime()).toBeGreaterThanOrEqual(deactivateTime.getTime());
    });
  });
});
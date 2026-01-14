import { Test, TestingModule } from '@nestjs/testing';
import { PriceCalculationService } from '../price-calculation.service';
import { PRICE_MODIFIER_REPOSITORY } from '../../repositories/injection-tokens';
import { IPriceModifierRepository } from '../../repositories/price-modifier.repository.interface';
import { PriceModifier } from '../../entities/price-modifier.entity';
import { ModifierType } from '../../enums/modifier-type.enum';
import { PriceCalculationContext } from '../price-calculation.types';

describe('PriceCalculationService', () => {
  let service: PriceCalculationService;
  let mockModifierRepository: jest.Mocked<IPriceModifierRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriceCalculationService,
        {
          provide: PRICE_MODIFIER_REPOSITORY,
          useValue: {
            findAllActive: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PriceCalculationService>(PriceCalculationService);
    mockModifierRepository = module.get(PRICE_MODIFIER_REPOSITORY);
  });

  describe('calculatePrice', () => {
    it('should calculate price with percentage modifier', async () => {
      // Arrange
      const mockModifier = {
        isApplicableFor: jest.fn().mockReturnValue(true),
        getModifierType: jest.fn().mockReturnValue(ModifierType.PERCENTAGE),
        getValue: jest.fn().mockReturnValue(10),
        getCode: jest.fn().mockReturnValue('TEST_MOD'),
        getName: jest.fn().mockReturnValue('Test Modifier'),
        getPriority: jest.fn().mockReturnValue(1),
      } as unknown as PriceModifier;

      mockModifierRepository.findAllActive.mockResolvedValue([mockModifier]);

      const context: PriceCalculationContext = {
        basePrice: 1000,
        propertyValues: new Map(),
        quantity: 2,
        unit: 1.5,
        coefficient: 1.2,
      };

      // Act
      const result = await service.calculatePrice(context);

      // Assert
      expect(result.basePrice).toBe(1000);
      expect(result.finalPrice).toBeCloseTo(1980); // 1000 * 1.1 * 1.5 * 1.2
      expect(result.totalPrice).toBeCloseTo(3960); // 1980 * 2
      expect(result.appliedModifiers).toHaveLength(1);
    });

    it('should calculate price with fixed amount modifier', async () => {
      // Arrange
      const mockModifier = {
        isApplicableFor: jest.fn().mockReturnValue(true),
        getModifierType: jest.fn().mockReturnValue(ModifierType.FIXED_AMOUNT),
        getValue: jest.fn().mockReturnValue(500),
        getCode: jest.fn().mockReturnValue('FIXED_MOD'),
        getName: jest.fn().mockReturnValue('Fixed Amount Modifier'),
        getPriority: jest.fn().mockReturnValue(1),
      } as unknown as PriceModifier;

      mockModifierRepository.findAllActive.mockResolvedValue([mockModifier]);

      const context: PriceCalculationContext = {
        basePrice: 1000,
        propertyValues: new Map(),
        quantity: 1,
        unit: 1,
        coefficient: 1,
      };

      // Act
      const result = await service.calculatePrice(context);

      // Assert
      expect(result.basePrice).toBe(1000);
      expect(result.finalPrice).toBe(1500); // (1000 + 500) * 1 * 1
      expect(result.totalPrice).toBe(1500); // 1500 * 1
    });

    it('should calculate price with multiplier modifier', async () => {
      // Arrange
      const mockModifier = {
        isApplicableFor: jest.fn().mockReturnValue(true),
        getModifierType: jest.fn().mockReturnValue(ModifierType.MULTIPLIER),
        getValue: jest.fn().mockReturnValue(1.5),
        getCode: jest.fn().mockReturnValue('MULT_MOD'),
        getName: jest.fn().mockReturnValue('Multiplier Modifier'),
        getPriority: jest.fn().mockReturnValue(1),
      } as unknown as PriceModifier;

      mockModifierRepository.findAllActive.mockResolvedValue([mockModifier]);

      const context: PriceCalculationContext = {
        basePrice: 1000,
        propertyValues: new Map(),
        quantity: 1,
        unit: 1,
        coefficient: 1,
      };

      // Act
      const result = await service.calculatePrice(context);

      // Assert
      expect(result.basePrice).toBe(1000);
      expect(result.finalPrice).toBe(1500); // 1000 * 1.5 * 1 * 1
      expect(result.totalPrice).toBe(1500);
    });

    it('should calculate price with per-unit modifier', async () => {
      // Arrange
      const mockModifier = {
        isApplicableFor: jest.fn().mockReturnValue(true),
        getModifierType: jest.fn().mockReturnValue(ModifierType.PER_UNIT),
        getValue: jest.fn().mockReturnValue(800),
        getCode: jest.fn().mockReturnValue('PER_UNIT_MOD'),
        getName: jest.fn().mockReturnValue('Per Unit Modifier'),
        getPriority: jest.fn().mockReturnValue(1),
      } as unknown as PriceModifier;

      mockModifierRepository.findAllActive.mockResolvedValue([mockModifier]);

      const context: PriceCalculationContext = {
        basePrice: 1000,
        propertyValues: new Map(),
        quantity: 2,
        unit: 1.5,
        coefficient: 1,
      };

      // Act
      const result = await service.calculatePrice(context);

      // Assert
      expect(result.basePrice).toBe(1000);
      expect(result.finalPrice).toBe(1200); // 800 * 1.5 * 1 (per-unit ignores base price)
      expect(result.totalPrice).toBe(2400); // 1200 * 2
    });

    it('should calculate price with fixed price modifier', async () => {
      // Arrange
      const mockModifier = {
        isApplicableFor: jest.fn().mockReturnValue(true),
        getModifierType: jest.fn().mockReturnValue(ModifierType.FIXED_PRICE),
        getValue: jest.fn().mockReturnValue(2000),
        getCode: jest.fn().mockReturnValue('FIXED_PRICE_MOD'),
        getName: jest.fn().mockReturnValue('Fixed Price Modifier'),
        getPriority: jest.fn().mockReturnValue(1),
      } as unknown as PriceModifier;

      mockModifierRepository.findAllActive.mockResolvedValue([mockModifier]);

      const context: PriceCalculationContext = {
        basePrice: 1000,
        propertyValues: new Map(),
        quantity: 1,
        unit: 1,
        coefficient: 1,
      };

      // Act
      const result = await service.calculatePrice(context);

      // Assert
      expect(result.basePrice).toBe(1000);
      expect(result.finalPrice).toBe(2000); // Fixed price replaces calculation
      expect(result.totalPrice).toBe(2000);
    });

    it('should apply multiple modifiers in priority order', async () => {
      // Arrange
      const mockModifier1 = {
        isApplicableFor: jest.fn().mockReturnValue(true),
        getModifierType: jest.fn().mockReturnValue(ModifierType.PERCENTAGE),
        getValue: jest.fn().mockReturnValue(10), // +10%
        getCode: jest.fn().mockReturnValue('MOD_1'),
        getName: jest.fn().mockReturnValue('Modifier 1'),
        getPriority: jest.fn().mockReturnValue(2),
      } as unknown as PriceModifier;

      const mockModifier2 = {
        isApplicableFor: jest.fn().mockReturnValue(true),
        getModifierType: jest.fn().mockReturnValue(ModifierType.FIXED_AMOUNT),
        getValue: jest.fn().mockReturnValue(200), // +200
        getCode: jest.fn().mockReturnValue('MOD_2'),
        getName: jest.fn().mockReturnValue('Modifier 2'),
        getPriority: jest.fn().mockReturnValue(1), // Higher priority
      } as unknown as PriceModifier;

      mockModifierRepository.findAllActive.mockResolvedValue([mockModifier1, mockModifier2]);

      const context: PriceCalculationContext = {
        basePrice: 1000,
        propertyValues: new Map(),
        quantity: 1,
        unit: 1,
        coefficient: 1,
      };

      // Act
      const result = await service.calculatePrice(context);

      // Assert
      // First apply fixed amount (+200), then percentage (+10% of 1200 = 120)
      expect(result.finalPrice).toBe(1320); // (1000 + 200) * 1.1
      expect(result.appliedModifiers).toHaveLength(2);
    });

    it('should filter out non-applicable modifiers', async () => {
      // Arrange
      const mockModifier1 = {
        isApplicableFor: jest.fn().mockReturnValue(true),
        getModifierType: jest.fn().mockReturnValue(ModifierType.PERCENTAGE),
        getValue: jest.fn().mockReturnValue(10),
        getCode: jest.fn().mockReturnValue('APPLICABLE_MOD'),
        getName: jest.fn().mockReturnValue('Applicable Modifier'),
        getPriority: jest.fn().mockReturnValue(1),
      } as unknown as PriceModifier;

      const mockModifier2 = {
        isApplicableFor: jest.fn().mockReturnValue(false),
        getModifierType: jest.fn().mockReturnValue(ModifierType.FIXED_AMOUNT),
        getValue: jest.fn().mockReturnValue(500),
        getCode: jest.fn().mockReturnValue('NON_APPLICABLE_MOD'),
        getName: jest.fn().mockReturnValue('Non-applicable Modifier'),
        getPriority: jest.fn().mockReturnValue(2),
      } as unknown as PriceModifier;

      mockModifierRepository.findAllActive.mockResolvedValue([mockModifier1, mockModifier2]);

      const context: PriceCalculationContext = {
        basePrice: 1000,
        propertyValues: new Map(),
        quantity: 1,
        unit: 1,
        coefficient: 1,
      };

      // Act
      const result = await service.calculatePrice(context);

      // Assert
      expect(result.finalPrice).toBe(1100); // Only applicable modifier applied
      expect(result.appliedModifiers).toHaveLength(1);
    });

    it('should validate context inputs', async () => {
      // Arrange
      const invalidContexts = [
        { basePrice: -100, quantity: 1, unit: 1, coefficient: 1, propertyValues: new Map() }, // Negative base price
        { basePrice: 1000, quantity: 0, unit: 1, coefficient: 1, propertyValues: new Map() }, // Zero quantity
        { basePrice: 1000, quantity: 1, unit: 0, coefficient: 1, propertyValues: new Map() }, // Zero unit
        { basePrice: 1000, quantity: 1, unit: 1, coefficient: 0, propertyValues: new Map() }, // Zero coefficient
      ];

      // Act & Assert
      for (const context of invalidContexts) {
        await expect(service.calculatePrice(context as any)).rejects.toThrow();
      }
    });
  });

  describe('calculatePriceWithModifiers', () => {
    it('should calculate price with provided modifiers array', () => {
      // Arrange
      const mockModifier = {
        getModifierType: jest.fn().mockReturnValue(ModifierType.PERCENTAGE),
        getValue: jest.fn().mockReturnValue(10),
        getPriority: jest.fn().mockReturnValue(1),
      } as unknown as PriceModifier;

      // Act
      const result = service.calculatePriceWithModifiers(1000, [mockModifier], 2, 1.5, 1.2);

      // Assert
      expect(result).toBeCloseTo(3960); // 1000 * 1.1 * 1.5 * 1.2 * 2
    });

    it('should handle per-unit modifier correctly', () => {
      // Arrange
      const mockModifier = {
        getModifierType: jest.fn().mockReturnValue(ModifierType.PER_UNIT),
        getValue: jest.fn().mockReturnValue(800),
        getPriority: jest.fn().mockReturnValue(1),
      } as unknown as PriceModifier;

      // Act
      const result = service.calculatePriceWithModifiers(1000, [mockModifier], 1, 1.5, 1);

      // Assert
      expect(result).toBe(1200); // 800 * 1.5 * 1 * 1 (ignores base price)
    });
  });
});
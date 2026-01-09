import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceModifierRepository } from '../../../src/modules/pricing/infrastructure/persistence/price-modifier.repository';
import { PriceModifierEntity } from '../../../src/modules/pricing/infrastructure/persistence/price-modifier.entity';
import { IPriceModifierRepository } from '../../../src/modules/pricing/domain/repositories/price-modifier.repository.interface';
import { PRICE_MODIFIER_REPOSITORY } from '../../../src/modules/pricing/domain/repositories/injection-tokens';
import { ModifierType } from '../../../src/modules/pricing/domain/enums/modifier-type.enum';
import { PriceModifier } from '../../../src/modules/pricing/domain/entities/price-modifier.entity';
import { config } from 'dotenv';

// Load environment variables
config();

describe('PriceModifierRepository (integration)', () => {
  let repository: IPriceModifierRepository;
  let entityRepository: Repository<PriceModifierEntity>;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DATABASE_HOST || 'localhost',
          port: parseInt(process.env.DATABASE_PORT || '5432', 10),
          username: process.env.DATABASE_USERNAME || 'postgres',
          password: process.env.DATABASE_PASSWORD || 'postgres',
          database: process.env.DATABASE_NAME || 'erp_production',
          entities: [PriceModifierEntity],
          synchronize: true, // Only for tests
          dropSchema: true, // Clean database before tests
          logging: false,
        }),
        TypeOrmModule.forFeature([PriceModifierEntity]),
      ],
      providers: [
        {
          provide: PRICE_MODIFIER_REPOSITORY,
          useClass: PriceModifierRepository,
        },
      ],
    }).compile();

    repository = module.get<IPriceModifierRepository>(PRICE_MODIFIER_REPOSITORY);
    entityRepository = module.get<Repository<PriceModifierEntity>>(getRepositoryToken(PriceModifierEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    // Clear database before each test
    await entityRepository.query('TRUNCATE TABLE price_modifiers RESTART IDENTITY CASCADE');
  });

  describe('save', () => {
    it('should save a new price modifier', async () => {
      const modifier = PriceModifier.create({
        name: 'Test Modifier',
        code: 'TEST_001',
        modifierType: ModifierType.PERCENTAGE,
        value: 10,
        priority: 1,
      });

      const savedModifier = await repository.save(modifier);

      expect(savedModifier.getId()).toBeDefined();
      expect(savedModifier.getName()).toBe('Test Modifier');
      expect(savedModifier.getCode()).toBe('TEST_001');
      expect(savedModifier.getIsActive()).toBe(true);

      // Verify in database
      const dbEntity = await entityRepository.findOne({ where: { code: 'TEST_001' } });
      expect(dbEntity).toBeDefined();
      expect(dbEntity!.name).toBe('Test Modifier');
    });

    it('should update an existing price modifier', async () => {
      // First create a modifier
      const modifier = PriceModifier.create({
        name: 'Original Modifier',
        code: 'UPDATE_TEST',
        modifierType: ModifierType.FIXED_AMOUNT,
        value: 100,
      });

      const savedModifier = await repository.save(modifier);

      // Update it
      savedModifier.updateInfo({ name: 'Updated Modifier', value: 200 });
      const updatedModifier = await repository.save(savedModifier);

      expect(updatedModifier.getName()).toBe('Updated Modifier');
      expect(updatedModifier.getValue()).toBe(200);

      // Verify in database
      const dbEntity = await entityRepository.findOne({ where: { code: 'UPDATE_TEST' } });
      expect(dbEntity!.name).toBe('Updated Modifier');
      expect(dbEntity!.value).toBe('200.0000');
    });
  });

  describe('findById', () => {
    it('should find modifier by id', async () => {
      // Create a modifier first
      const modifier = PriceModifier.create({
        name: 'Find Test',
        code: 'FIND_001',
        modifierType: ModifierType.PERCENTAGE,
        value: 15,
      });

      const savedModifier = await repository.save(modifier);
      const foundModifier = await repository.findById(savedModifier.getId()!);

      expect(foundModifier).toBeDefined();
      expect(foundModifier!.getId()).toBe(savedModifier.getId());
      expect(foundModifier!.getName()).toBe('Find Test');
    });

    it('should return null for non-existent id', async () => {
      const foundModifier = await repository.findById(999999);
      expect(foundModifier).toBeNull();
    });
  });

  describe('findByCode', () => {
    it('should find modifier by code', async () => {
      // Create a modifier first
      const modifier = PriceModifier.create({
        name: 'Code Test',
        code: 'CODE_FIND',
        modifierType: ModifierType.FIXED_PRICE,
        value: 1500,
      });

      await repository.save(modifier);
      const foundModifier = await repository.findByCode('CODE_FIND');

      expect(foundModifier).toBeDefined();
      expect(foundModifier!.getCode()).toBe('CODE_FIND');
      expect(foundModifier!.getModifierType()).toBe(ModifierType.FIXED_PRICE);
    });

    it('should return null for non-existent code', async () => {
      const foundModifier = await repository.findByCode('NON_EXISTENT');
      expect(foundModifier).toBeNull();
    });
  });

  describe('existsByCode', () => {
    it('should return true when code exists', async () => {
      const modifier = PriceModifier.create({
        name: 'Exists Test',
        code: 'EXISTS_001',
        modifierType: ModifierType.PERCENTAGE,
        value: 10,
      });

      await repository.save(modifier);
      const exists = await repository.existsByCode('EXISTS_001');

      expect(exists).toBe(true);
    });

    it('should return false when code does not exist', async () => {
      const exists = await repository.existsByCode('NON_EXISTENT');
      expect(exists).toBe(false);
    });
  });

  describe('findAllActive', () => {
    it('should return all active modifiers ordered by priority', async () => {
      // Create multiple modifiers with different priorities
      const modifier1 = PriceModifier.create({
        name: 'Low Priority',
        code: 'LOW_PRIORITY',
        modifierType: ModifierType.PERCENTAGE,
        value: 5,
        priority: 10,
      });

      const modifier2 = PriceModifier.create({
        name: 'High Priority',
        code: 'HIGH_PRIORITY',
        modifierType: ModifierType.PERCENTAGE,
        value: 15,
        priority: 1,
      });

      const modifier3 = PriceModifier.create({
        name: 'Medium Priority',
        code: 'MEDIUM_PRIORITY',
        modifierType: ModifierType.FIXED_AMOUNT,
        value: 100,
        priority: 5,
      });

      await repository.save(modifier1);
      await repository.save(modifier2);
      await repository.save(modifier3);

      const activeModifiers = await repository.findAllActive();

      expect(activeModifiers).toHaveLength(3);
      
      // Should be ordered by priority (ascending)
      expect(activeModifiers[0].getCode()).toBe('HIGH_PRIORITY');
      expect(activeModifiers[1].getCode()).toBe('MEDIUM_PRIORITY');
      expect(activeModifiers[2].getCode()).toBe('LOW_PRIORITY');
    });

    it('should not return inactive modifiers', async () => {
      // Create active modifier
      const activeModifier = PriceModifier.create({
        name: 'Active Modifier',
        code: 'ACTIVE_001',
        modifierType: ModifierType.PERCENTAGE,
        value: 10,
      });

      // Create inactive modifier
      const inactiveModifier = PriceModifier.create({
        name: 'Inactive Modifier',
        code: 'INACTIVE_001',
        modifierType: ModifierType.PERCENTAGE,
        value: 20,
      });
      inactiveModifier.deactivate();

      await repository.save(activeModifier);
      await repository.save(inactiveModifier);

      const activeModifiers = await repository.findAllActive();

      expect(activeModifiers).toHaveLength(1);
      expect(activeModifiers[0].getCode()).toBe('ACTIVE_001');
    });
  });

  describe('findByPropertyId', () => {
    it('should find modifiers by property id', async () => {
      // Create modifiers with property binding
      const modifier1 = PriceModifier.create({
        name: 'Property Modifier 1',
        code: 'PROP_001',
        modifierType: ModifierType.FIXED_AMOUNT,
        value: 50,
        propertyId: 1,
        propertyValue: 'white',
      });

      const modifier2 = PriceModifier.create({
        name: 'Property Modifier 2',
        code: 'PROP_002',
        modifierType: ModifierType.PERCENTAGE,
        value: 10,
        propertyId: 1,
        propertyValue: 'black',
      });

      const modifier3 = PriceModifier.create({
        name: 'Different Property',
        code: 'PROP_003',
        modifierType: ModifierType.FIXED_AMOUNT,
        value: 75,
        propertyId: 2,
        propertyValue: 'glossy',
      });

      await repository.save(modifier1);
      await repository.save(modifier2);
      await repository.save(modifier3);

      const propertyModifiers = await repository.findByPropertyId(1);

      expect(propertyModifiers).toHaveLength(2);
      const codes = propertyModifiers.map(m => m.getCode());
      expect(codes).toContain('PROP_001');
      expect(codes).toContain('PROP_002');
      expect(codes).not.toContain('PROP_003');
    });

    it('should return only active modifiers for property', async () => {
      const activeModifier = PriceModifier.create({
        name: 'Active Property Modifier',
        code: 'ACTIVE_PROP',
        modifierType: ModifierType.PERCENTAGE,
        value: 15,
        propertyId: 1,
        propertyValue: 'premium',
      });

      const inactiveModifier = PriceModifier.create({
        name: 'Inactive Property Modifier',
        code: 'INACTIVE_PROP',
        modifierType: ModifierType.FIXED_AMOUNT,
        value: 200,
        propertyId: 1,
        propertyValue: 'standard',
      });
      inactiveModifier.deactivate();

      await repository.save(activeModifier);
      await repository.save(inactiveModifier);

      const propertyModifiers = await repository.findByPropertyId(1);

      expect(propertyModifiers).toHaveLength(1);
      expect(propertyModifiers[0].getCode()).toBe('ACTIVE_PROP');
    });
  });

  describe('delete', () => {
    it('should delete modifier by id', async () => {
      const modifier = PriceModifier.create({
        name: 'Delete Test',
        code: 'DELETE_001',
        modifierType: ModifierType.PERCENTAGE,
        value: 10,
      });

      const savedModifier = await repository.save(modifier);
      const id = savedModifier.getId()!;

      await repository.delete(id);

      const foundModifier = await repository.findById(id);
      expect(foundModifier).toBeNull();

      // Verify in database
      const dbEntity = await entityRepository.findOne({ where: { id } });
      expect(dbEntity).toBeNull();
    });

    it('should not throw error when deleting non-existent id', async () => {
      // This should not throw an error
      await expect(repository.delete(999999)).resolves.not.toThrow();
    });
  });

  describe('complex scenarios', () => {
    it('should handle modifier with property binding correctly', async () => {
      const modifier = PriceModifier.create({
        name: 'Complex Property Modifier',
        code: 'COMPLEX_001',
        modifierType: ModifierType.PER_UNIT,
        value: 25.50,
        propertyId: 5,
        propertyValue: 'special_finish',
        priority: 3,
      });

      const savedModifier = await repository.save(modifier);

      // Verify all properties are saved correctly
      expect(savedModifier.getPropertyId()).toBe(5);
      expect(savedModifier.getPropertyValue()).toBe('special_finish');
      expect(savedModifier.getPriority()).toBe(3);
      expect(savedModifier.getModifierType()).toBe(ModifierType.PER_UNIT);

      // Verify in database
      const dbEntity = await entityRepository.findOne({ where: { code: 'COMPLEX_001' } });
      expect(dbEntity).toBeDefined();
      expect(dbEntity!.propertyId).toBe(5);
      expect(dbEntity!.propertyValue).toBe('special_finish');
      expect(dbEntity!.priority).toBe(3);
      expect(dbEntity!.modifierType).toBe(ModifierType.PER_UNIT);
    });

    it('should maintain data integrity across operations', async () => {
      // Create multiple modifiers
      const modifiers = [
        PriceModifier.create({
          name: 'Integrity Test 1',
          code: 'INT_001',
          modifierType: ModifierType.PERCENTAGE,
          value: 10,
        }),
        PriceModifier.create({
          name: 'Integrity Test 2',
          code: 'INT_002',
          modifierType: ModifierType.FIXED_AMOUNT,
          value: 150,
        }),
        PriceModifier.create({
          name: 'Integrity Test 3',
          code: 'INT_003',
          modifierType: ModifierType.MULTIPLIER,
          value: 1.25,
        }),
      ];

      // Save all modifiers
      const savedModifiers = await Promise.all(
        modifiers.map(modifier => repository.save(modifier))
      );

      // Verify counts
      const allActive = await repository.findAllActive();
      expect(allActive).toHaveLength(3);

      // Verify each modifier can be found individually
      for (const savedModifier of savedModifiers) {
        const found = await repository.findById(savedModifier.getId()!);
        expect(found).toBeDefined();
        expect(found!.getCode()).toBe(savedModifier.getCode());
      }

      // Delete one and verify count
      await repository.delete(savedModifiers[0].getId()!);
      const remaining = await repository.findAllActive();
      expect(remaining).toHaveLength(2);
    });
  });
});
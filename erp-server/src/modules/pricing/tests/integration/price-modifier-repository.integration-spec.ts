import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PriceModifierRepository } from '../../infrastructure/persistence/price-modifier.repository';
import { PriceModifierEntity } from '../../infrastructure/persistence/price-modifier.entity';
import { ModifierType } from '../../domain/enums/modifier-type.enum';
import { PriceModifier } from '../../domain/entities/price-modifier.entity';

describe('PriceModifierRepository Integration', () => {
  let repository: PriceModifierRepository;
  let priceModifierRepo: Repository<PriceModifierEntity>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [PriceModifierEntity],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([PriceModifierEntity]),
      ],
      providers: [PriceModifierRepository],
    }).compile();

    repository = module.get<PriceModifierRepository>(PriceModifierRepository);
    priceModifierRepo = module.get<Repository<PriceModifierEntity>>(getRepositoryToken(PriceModifierEntity));
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    if (dataSource) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    await priceModifierRepo.query('DELETE FROM price_modifier_entity');
  });

  describe('save', () => {
    it('should save a new price modifier', async () => {
      const modifierProps = {
        name: 'Test Modifier',
        code: 'TEST-MOD-001',
        modifierType: ModifierType.PERCENTAGE,
        value: 10,
        propertyId: 1,
        propertyValue: 'test-value',
        conditionExpression: 'propertyValue > 100',
        priority: 1,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      const modifier = PriceModifier.create(modifierProps);
      const savedModifier = await repository.save(modifier);

      expect(savedModifier).toBeDefined();
      expect(savedModifier.getId()).toBeDefined();
      expect(savedModifier.getName()).toBe('Test Modifier');
      expect(savedModifier.getCode()).toBe('TEST-MOD-001');
      expect(savedModifier.getModifierType()).toBe(ModifierType.PERCENTAGE);
      expect(savedModifier.getValue()).toBe(10);
      // По умолчанию isActive = true
      expect(savedModifier.getIsActive()).toBe(true);
    });
  });

  describe('findById', () => {
    it('should find price modifier by id', async () => {
      const modifier = PriceModifier.create({
        name: 'Test Modifier',
        code: 'FIND-BY-ID',
        modifierType: ModifierType.MULTIPLIER,
        value: 1.5,
        priority: 1,
      });

      const savedModifier = await repository.save(modifier);
      const foundModifier = await repository.findById(savedModifier.getId()!);

      expect(foundModifier).toBeDefined();
      expect(foundModifier!.getId()).toBe(savedModifier.getId());
      expect(foundModifier!.getCode()).toBe('FIND-BY-ID');
    });

    it('should return null for non-existent modifier', async () => {
      const foundModifier = await repository.findById(999999);
      expect(foundModifier).toBeNull();
    });
  });

  describe('findByCode', () => {
    it('should find price modifier by code', async () => {
      const modifier = PriceModifier.create({
        name: 'Code Test Modifier',
        code: 'CODE-TEST-001',
        modifierType: ModifierType.FIXED_PRICE,
        value: 500,
        priority: 1,
      });

      await repository.save(modifier);
      const foundModifier = await repository.findByCode('CODE-TEST-001');

      expect(foundModifier).toBeDefined();
      expect(foundModifier!.getCode()).toBe('CODE-TEST-001');
    });
  });

  describe('findAllActive', () => {
    it('should find all active modifiers ordered by priority', async () => {
      // Создаем активный модификатор через restore (так как create не принимает isActive)
      const activeModifier = PriceModifier.restore({
        id: 1,
        name: 'Active Modifier',
        code: 'ACTIVE-MOD',
        modifierType: ModifierType.PERCENTAGE,
        value: 15,
        propertyId: null,
        propertyValue: null,
        conditionExpression: null,
        priority: 1,
        isActive: true,
        startDate: null,
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Создаем неактивный модификатор
      const inactiveModifier = PriceModifier.restore({
        id: 2,
        name: 'Inactive Modifier',
        code: 'INACTIVE-MOD',
        modifierType: ModifierType.PERCENTAGE,
        value: 5,
        propertyId: null,
        propertyValue: null,
        conditionExpression: null,
        priority: 2,
        isActive: false,
        startDate: null,
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await repository.save(activeModifier);
      await repository.save(inactiveModifier);

      const activeModifiers = await repository.findAllActive();

      expect(activeModifiers).toHaveLength(1);
      expect(activeModifiers[0].getPriority()).toBe(1);
      expect(activeModifiers[0].getIsActive()).toBe(true);
    });
  });
});
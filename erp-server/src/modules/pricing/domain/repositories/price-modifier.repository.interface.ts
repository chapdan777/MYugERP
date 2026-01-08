import { PriceModifier } from '../entities/price-modifier.entity';

/**
 * Интерфейс репозитория для PriceModifier
 * Используется abstract class вместо interface из-за emitDecoratorMetadata
 */
export abstract class IPriceModifierRepository {
  abstract save(modifier: PriceModifier): Promise<PriceModifier>;
  abstract findById(id: number): Promise<PriceModifier | null>;
  abstract findByCode(code: string): Promise<PriceModifier | null>;
  abstract existsByCode(code: string): Promise<boolean>;
  abstract findAllActive(): Promise<PriceModifier[]>;
  abstract findByPropertyId(propertyId: number): Promise<PriceModifier[]>;
  abstract delete(id: number): Promise<void>;
}

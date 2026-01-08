import { Property } from '../entities/property.entity';

/**
 * Интерфейс репозитория для Property (abstract class для совместимости с decorators)
 */
export abstract class IPropertyRepository {
  abstract save(property: Property): Promise<Property>;
  abstract findById(id: number): Promise<Property | null>;
  abstract findByCode(code: string): Promise<Property | null>;
  abstract findByIds(ids: number[]): Promise<Property[]>;
  abstract findAllActive(): Promise<Property[]>;
  abstract findAll(): Promise<Property[]>;
  abstract existsByCode(code: string): Promise<boolean>;
  abstract delete(id: number): Promise<void>;
}

import { PropertyDependency } from '../entities/property-dependency.entity';

/**
 * Интерфейс репозитория для PropertyDependency
 */
export abstract class IPropertyDependencyRepository {
  abstract save(dependency: PropertyDependency): Promise<PropertyDependency>;
  abstract findById(id: number): Promise<PropertyDependency | null>;
  abstract findBySourcePropertyId(sourcePropertyId: number): Promise<PropertyDependency[]>;
  abstract findByTargetPropertyId(targetPropertyId: number): Promise<PropertyDependency[]>;
  abstract findAllActive(): Promise<PropertyDependency[]>;
  abstract delete(id: number): Promise<void>;
}

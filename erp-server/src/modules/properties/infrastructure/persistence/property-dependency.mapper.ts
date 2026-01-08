import { PropertyDependency } from '../../domain/entities/property-dependency.entity';
import { PropertyDependencyEntity } from './property-dependency.entity';
import { DependencyType } from '../../domain/enums/dependency-type.enum';

/**
 * Mapper для преобразования между PropertyDependency domain и PropertyDependencyEntity persistence
 */
export class PropertyDependencyMapper {
  static toDomain(entity: PropertyDependencyEntity): PropertyDependency {
    return PropertyDependency.restore({
      id: entity.id,
      sourcePropertyId: entity.sourcePropertyId,
      targetPropertyId: entity.targetPropertyId,
      dependencyType: entity.dependencyType as DependencyType,
      sourceValue: entity.sourceValue,
      targetValue: entity.targetValue,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPersistence(domain: PropertyDependency): PropertyDependencyEntity {
    const entity = new PropertyDependencyEntity();
    
    if (domain.getId()) {
      entity.id = domain.getId()!;
    }
    
    entity.sourcePropertyId = domain.getSourcePropertyId();
    entity.targetPropertyId = domain.getTargetPropertyId();
    entity.dependencyType = domain.getDependencyType();
    entity.sourceValue = domain.getSourceValue();
    entity.targetValue = domain.getTargetValue();
    entity.isActive = domain.getIsActive();
    entity.createdAt = domain.getCreatedAt();
    entity.updatedAt = domain.getUpdatedAt();

    return entity;
  }

  static toDomainList(entities: PropertyDependencyEntity[]): PropertyDependency[] {
    return entities.map(entity => PropertyDependencyMapper.toDomain(entity));
  }
}

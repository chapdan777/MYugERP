import { PropertyHeader } from '../../domain/entities/property-header.entity';
import { PropertyHeaderEntity } from '../persistence/property-header.entity';

/**
 * Mapper для преобразования между доменной сущностью и сущностью БД
 */
export class PropertyHeaderMapper {
  static toDomain(entity: PropertyHeaderEntity): PropertyHeader {
    return PropertyHeader.restore({
      id: entity.id,
      name: entity.name,
      orderTypeId: entity.orderTypeId,
      description: entity.description || null,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPersistence(domain: PropertyHeader): PropertyHeaderEntity {
    const entity = new PropertyHeaderEntity();
    entity.id = domain.getId()!;
    entity.name = domain.getName();
    entity.orderTypeId = domain.getOrderTypeId();
    entity.description = domain.getDescription() || undefined;
    entity.isActive = domain.getIsActive();
    entity.createdAt = domain.getCreatedAt();
    entity.updatedAt = domain.getUpdatedAt();
    return entity;
  }
}
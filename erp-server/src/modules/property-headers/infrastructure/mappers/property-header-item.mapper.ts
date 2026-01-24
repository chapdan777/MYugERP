import { PropertyHeaderItem } from '../../domain/entities/property-header-item.entity';
import { PropertyHeaderItemEntity } from '../persistence/property-header-item.entity';

/**
 * Mapper для преобразования элементов шапки между доменом и БД
 */
export class PropertyHeaderItemMapper {
  static toDomain(entity: PropertyHeaderItemEntity): PropertyHeaderItem {
    return PropertyHeaderItem.restore({
      headerId: entity.headerId,
      propertyId: entity.propertyId,
      sortOrder: entity.sortOrder,
      createdAt: entity.createdAt,
    });
  }

  static toPersistence(domain: PropertyHeaderItem): PropertyHeaderItemEntity {
    const entity = new PropertyHeaderItemEntity();
    entity.headerId = domain.getHeaderId();
    entity.propertyId = domain.getPropertyId();
    entity.sortOrder = domain.getSortOrder();
    entity.createdAt = domain.getCreatedAt();
    return entity;
  }
}
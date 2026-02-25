import { PropertyValue } from '../../domain/entities/property-value.entity';
import { PropertyValueEntity } from './property-value.entity';

import { PriceModifierMapper } from '../../../pricing/infrastructure/persistence/price-modifier.mapper';

export class PropertyValueMapper {
  static toDomain(entity: PropertyValueEntity): PropertyValue {
    return PropertyValue.restore({
      id: entity.id,
      propertyId: entity.propertyId,
      value: entity.value,
      priceModifierId: entity.priceModifierId,
      priceModifier: entity.priceModifier ? PriceModifierMapper.toDomain(entity.priceModifier) : null,
      displayOrder: entity.displayOrder,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPersistence(domain: PropertyValue): PropertyValueEntity {
    const entity = new PropertyValueEntity();

    if (domain.getId()) {
      entity.id = domain.getId()!;
    }

    entity.propertyId = domain.getPropertyId();
    entity.value = domain.getValue();
    entity.priceModifierId = domain.getPriceModifierId();
    entity.displayOrder = domain.getDisplayOrder();
    entity.isActive = domain.getIsActive();
    entity.createdAt = domain.getCreatedAt();
    entity.updatedAt = domain.getUpdatedAt();

    return entity;
  }
}
import { ProductProperty } from '../../domain/entities/product-property.entity';
import { ProductPropertyEntity } from './product-property.entity';

/**
 * Mapper для преобразования между ProductProperty domain и ProductPropertyEntity persistence
 */
export class ProductPropertyMapper {
  /**
   * Преобразование из persistence в domain
   */
  static toDomain(entity: ProductPropertyEntity): ProductProperty {
    return ProductProperty.restore({
      id: entity.id,
      productId: entity.productId,
      propertyId: entity.propertyId,
      isRequired: entity.isRequired,
      displayOrder: entity.displayOrder,
      createdAt: entity.createdAt,
    });
  }

  /**
   * Преобразование из domain в persistence
   */
  static toPersistence(domain: ProductProperty): ProductPropertyEntity {
    const entity = new ProductPropertyEntity();
    
    if (domain.getId()) {
      entity.id = domain.getId()!;
    }
    
    entity.productId = domain.getProductId();
    entity.propertyId = domain.getPropertyId();
    entity.isRequired = domain.getIsRequired();
    entity.displayOrder = domain.getDisplayOrder();
    entity.createdAt = domain.getCreatedAt();

    return entity;
  }

  /**
   * Преобразование списка из persistence в domain
   */
  static toDomainList(entities: ProductPropertyEntity[]): ProductProperty[] {
    return entities.map(entity => ProductPropertyMapper.toDomain(entity));
  }
}

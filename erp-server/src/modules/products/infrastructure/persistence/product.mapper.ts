import { Product } from '../../domain/entities/product.entity';
import { ProductEntity } from './product.entity';
import { ProductCategory } from '../../domain/enums/product-category.enum';
import { UnitOfMeasure } from '../../domain/value-objects/unit-of-measure.vo';

/**
 * Mapper для преобразования между Product domain и ProductEntity persistence
 */
export class ProductMapper {
  /**
   * Преобразование из persistence в domain
   */
  static toDomain(entity: ProductEntity): Product {
    return Product.restore({
      id: entity.id,
      name: entity.name,
      code: entity.code,
      category: entity.category as ProductCategory,
      description: entity.description,
      basePrice: Number(entity.basePrice),
      unit: UnitOfMeasure.create(entity.unit),
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  /**
   * Преобразование из domain в persistence
   */
  static toPersistence(domain: Product): ProductEntity {
    const entity = new ProductEntity();
    
    if (domain.getId()) {
      entity.id = domain.getId()!;
    }
    
    entity.name = domain.getName();
    entity.code = domain.getCode();
    entity.category = domain.getCategory();
    entity.description = domain.getDescription();
    entity.basePrice = domain.getBasePrice();
    entity.unit = domain.getUnit().getValue();
    entity.isActive = domain.getIsActive();
    entity.createdAt = domain.getCreatedAt();
    entity.updatedAt = domain.getUpdatedAt();

    return entity;
  }

  /**
   * Преобразование списка из persistence в domain
   */
  static toDomainList(entities: ProductEntity[]): Product[] {
    return entities.map(entity => ProductMapper.toDomain(entity));
  }
}

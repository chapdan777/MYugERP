import { ProductProperty } from '../entities/product-property.entity';

/**
 * Интерфейс репозитория для ProductProperty
 */
export abstract class IProductPropertyRepository {
  abstract save(productProperty: ProductProperty): Promise<ProductProperty>;
  abstract findById(id: number): Promise<ProductProperty | null>;
  abstract findByProductId(productId: number): Promise<ProductProperty[]>;
  abstract findByPropertyId(propertyId: number): Promise<ProductProperty[]>;
  abstract findByProductAndProperty(productId: number, propertyId: number): Promise<ProductProperty | null>;
  abstract delete(id: number): Promise<void>;
  abstract deleteByProductId(productId: number): Promise<void>;
}

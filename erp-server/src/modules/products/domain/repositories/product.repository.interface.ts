import { Product } from '../entities/product.entity';
import { ProductCategory } from '../enums/product-category.enum';

/**
 * Интерфейс репозитория для Product (abstract class для совместимости с decorators)
 */
export abstract class IProductRepository {
  abstract save(product: Product): Promise<Product>;
  abstract findById(id: number): Promise<Product | null>;
  abstract findByCode(code: string): Promise<Product | null>;
  abstract findByCategory(category: ProductCategory): Promise<Product[]>;
  abstract findAllActive(): Promise<Product[]>;
  abstract findAll(): Promise<Product[]>;
  abstract existsByCode(code: string): Promise<boolean>;
  abstract delete(id: number): Promise<void>;
}

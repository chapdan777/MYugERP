import { Product } from '../../domain/entities/product.entity';
import { ProductCategory } from '../../domain/enums/product-category.enum';

/**
 * DTO для ответа с информацией о продукте
 */
export class ProductResponseDto {
  id!: number;
  name!: string;
  code!: string;
  category!: ProductCategory;
  description!: string | null;
  basePrice!: number;
  unit!: string;
  defaultLength!: number | null;
  defaultWidth!: number | null;
  defaultDepth!: number | null;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  static fromDomain(product: Product): ProductResponseDto {
    const dto = new ProductResponseDto();
    dto.id = product.getId()!;
    dto.name = product.getName();
    dto.code = product.getCode();
    dto.category = product.getCategory();
    dto.description = product.getDescription();
    dto.basePrice = product.getBasePrice();
    dto.unit = product.getUnit().getValue();
    dto.defaultLength = product.getDefaultLength();
    dto.defaultWidth = product.getDefaultWidth();
    dto.defaultDepth = product.getDefaultDepth();
    dto.isActive = product.getIsActive();
    dto.createdAt = product.getCreatedAt();
    dto.updatedAt = product.getUpdatedAt();
    return dto;
  }

  static fromDomainList(products: Product[]): ProductResponseDto[] {
    return products.map(product => ProductResponseDto.fromDomain(product));
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { ProductCategory } from '../../domain/enums/product-category.enum';

/**
 * Use Case: Получение продуктов по категории
 */
@Injectable()
export class GetProductsByCategoryUseCase {
    constructor(
        @Inject(PRODUCT_REPOSITORY)
        private readonly productRepository: IProductRepository,
    ) { }

    async execute(category: ProductCategory): Promise<Product[]> {
        return this.productRepository.findByCategory(category);
    }
}

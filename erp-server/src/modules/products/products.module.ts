import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './infrastructure/persistence/product.entity';
import { ProductPropertyEntity } from './infrastructure/persistence/product-property.entity';
import { ProductRepository } from './infrastructure/persistence/product.repository';
import { ProductPropertyRepository } from './infrastructure/persistence/product-property.repository';
import { PRODUCT_REPOSITORY, PRODUCT_PROPERTY_REPOSITORY } from './domain/repositories/injection-tokens';
import {
  CreateProductUseCase,
  GetProductByIdUseCase,
  GetAllActiveProductsUseCase,
  UpdateProductUseCase,
  ActivateProductUseCase,
  DeactivateProductUseCase,
} from './application/use-cases';
import { ProductsController } from './presentation/controllers/products.controller';

/**
 * Модуль управления продуктами
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity, ProductPropertyEntity]),
  ],
  providers: [
    // Repositories
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductRepository,
    },
    {
      provide: PRODUCT_PROPERTY_REPOSITORY,
      useClass: ProductPropertyRepository,
    },
    // Use Cases
    CreateProductUseCase,
    GetProductByIdUseCase,
    GetAllActiveProductsUseCase,
    UpdateProductUseCase,
    ActivateProductUseCase,
    DeactivateProductUseCase,
  ],
  controllers: [ProductsController],
  exports: [
    PRODUCT_REPOSITORY,
    PRODUCT_PROPERTY_REPOSITORY,
  ],
})
export class ProductsModule {}

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './infrastructure/persistence/product.entity';
import { ProductPropertyEntity } from './infrastructure/persistence/product-property.entity';
import { ProductRepository } from './infrastructure/persistence/product.repository';
import { ProductPropertyRepository } from './infrastructure/persistence/product-property.repository';
import { PRODUCT_REPOSITORY, PRODUCT_PROPERTY_REPOSITORY } from './domain/repositories/injection-tokens';
import { ProductionModule } from '../production/production.module';
import {
  CreateProductUseCase,
  GetProductByIdUseCase,
  GetAllActiveProductsUseCase,
  GetProductsByCategoryUseCase,
  UpdateProductUseCase,
  ActivateProductUseCase,
  DeactivateProductUseCase,
  CloneProductUseCase,
} from './application/use-cases';
import { SetProductPropertiesUseCase } from './application/use-cases/set-product-properties.use-case';
import { GetProductPropertiesUseCase } from './application/use-cases/get-product-properties.use-case';
import { ProductsController } from './presentation/controllers/products.controller';

/**
 * Модуль управления продуктами
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity, ProductPropertyEntity]),
    forwardRef(() => ProductionModule),
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
    GetProductsByCategoryUseCase,
    UpdateProductUseCase,
    ActivateProductUseCase,
    DeactivateProductUseCase,
    CloneProductUseCase,
    SetProductPropertiesUseCase,
    GetProductPropertiesUseCase,
  ],
  controllers: [ProductsController],
  exports: [
    PRODUCT_REPOSITORY,
    PRODUCT_PROPERTY_REPOSITORY,
  ],
})
export class ProductsModule { }

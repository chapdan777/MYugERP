import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyHeadersController, PropertyHeaderItemsController } from './presentation/controllers';
import { PropertyHeaderService } from './domain/services';

// UseCases
import {
  CreatePropertyHeaderUseCase,
  GetPropertyHeaderByIdUseCase,
  GetAllPropertyHeadersUseCase,
  UpdatePropertyHeaderUseCase,
  ActivatePropertyHeaderUseCase,
  DeactivatePropertyHeaderUseCase,
  AddItemToHeaderUseCase,
  GetHeaderItemsUseCase,
  RemoveItemFromHeaderUseCase,
  DeletePropertyHeaderUseCase,
  UpdateHeaderItemUseCase,
  AddProductToHeaderUseCase,
  RemoveProductFromHeaderUseCase,
  GetHeaderProductsUseCase,
} from './application/use-cases';

// Repositories
import {
  PropertyHeaderRepository,
  PropertyHeaderItemRepository,
  PropertyHeaderProductRepository,
} from './infrastructure/repositories';
import {
  PROPERTY_HEADER_REPOSITORY,
  PROPERTY_HEADER_ITEM_REPOSITORY,
  PROPERTY_HEADER_PRODUCT_REPOSITORY,
} from './domain/repositories';

// Entities
import {
  PropertyHeaderEntity,
  PropertyHeaderItemEntity,
  PropertyHeaderProductEntity,
} from './infrastructure/persistence';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PropertyHeaderEntity,
      PropertyHeaderItemEntity,
      PropertyHeaderProductEntity,
    ]),
  ],
  controllers: [PropertyHeadersController, PropertyHeaderItemsController],
  providers: [
    // Domain Services
    {
      provide: PropertyHeaderService,
      useFactory: (propertyHeaderRepo, propertyHeaderItemRepo, propertyHeaderProductRepo) => new PropertyHeaderService(
        propertyHeaderRepo,
        propertyHeaderItemRepo,
        propertyHeaderProductRepo,
      ),
      inject: [
        PROPERTY_HEADER_REPOSITORY,
        PROPERTY_HEADER_ITEM_REPOSITORY,
        PROPERTY_HEADER_PRODUCT_REPOSITORY,
      ],
    },

    // UseCases
    CreatePropertyHeaderUseCase,
    GetPropertyHeaderByIdUseCase,
    GetAllPropertyHeadersUseCase,
    UpdatePropertyHeaderUseCase,
    ActivatePropertyHeaderUseCase,
    DeactivatePropertyHeaderUseCase,
    AddItemToHeaderUseCase,
    GetHeaderItemsUseCase,
    RemoveItemFromHeaderUseCase,
    DeletePropertyHeaderUseCase,
    UpdateHeaderItemUseCase,
    AddProductToHeaderUseCase,
    RemoveProductFromHeaderUseCase,
    GetHeaderProductsUseCase,

    // Repositories
    {
      provide: PROPERTY_HEADER_REPOSITORY,
      useClass: PropertyHeaderRepository,
    },
    {
      provide: PROPERTY_HEADER_ITEM_REPOSITORY,
      useClass: PropertyHeaderItemRepository,
    },
    {
      provide: PROPERTY_HEADER_PRODUCT_REPOSITORY,
      useClass: PropertyHeaderProductRepository,
    },

    // Service dependencies
    {
      provide: 'PropertyHeaderServiceDependencies',
      useFactory: (propertyHeaderRepo, propertyHeaderItemRepo, propertyHeaderProductRepo) => ({
        propertyHeaderRepository: propertyHeaderRepo,
        propertyHeaderItemRepository: propertyHeaderItemRepo,
        propertyHeaderProductRepository: propertyHeaderProductRepo,
      }),
      inject: [
        PROPERTY_HEADER_REPOSITORY,
        PROPERTY_HEADER_ITEM_REPOSITORY,
        PROPERTY_HEADER_PRODUCT_REPOSITORY,
      ],
    },
  ],
  exports: [
    CreatePropertyHeaderUseCase,
    GetPropertyHeaderByIdUseCase,
    GetAllPropertyHeadersUseCase,
    UpdatePropertyHeaderUseCase,
    ActivatePropertyHeaderUseCase,
    DeactivatePropertyHeaderUseCase,
    AddItemToHeaderUseCase,
    GetHeaderItemsUseCase,
    RemoveItemFromHeaderUseCase,
    DeletePropertyHeaderUseCase,
    UpdateHeaderItemUseCase,
    AddProductToHeaderUseCase,
    RemoveProductFromHeaderUseCase,
    GetHeaderProductsUseCase,
  ],
})
export class PropertyHeadersModule { }
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
} from './application/use-cases';

// Repositories
import { PropertyHeaderRepository, PropertyHeaderItemRepository } from './infrastructure/repositories';
import {
  PROPERTY_HEADER_REPOSITORY,
  PROPERTY_HEADER_ITEM_REPOSITORY,
} from './domain/repositories';

// Entities
import { PropertyHeaderEntity, PropertyHeaderItemEntity } from './infrastructure/persistence';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertyHeaderEntity, PropertyHeaderItemEntity]),
  ],
  controllers: [PropertyHeadersController, PropertyHeaderItemsController],
  providers: [
    // Domain Services
    {
      provide: PropertyHeaderService,
      useFactory: (deps: any) => new PropertyHeaderService(
        deps.propertyHeaderRepository,
        deps.propertyHeaderItemRepository
      ),
      inject: ['PropertyHeaderServiceDependencies'],
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

    // Repositories
    {
      provide: PROPERTY_HEADER_REPOSITORY,
      useClass: PropertyHeaderRepository,
    },
    {
      provide: PROPERTY_HEADER_ITEM_REPOSITORY,
      useClass: PropertyHeaderItemRepository,
    },
    
    // Service dependencies
    {
      provide: 'PropertyHeaderServiceDependencies',
      useFactory: (propertyHeaderRepo, propertyHeaderItemRepo) => ({
        propertyHeaderRepository: propertyHeaderRepo,
        propertyHeaderItemRepository: propertyHeaderItemRepo,
      }),
      inject: [PROPERTY_HEADER_REPOSITORY, PROPERTY_HEADER_ITEM_REPOSITORY],
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
  ],
})
export class PropertyHeadersModule {}
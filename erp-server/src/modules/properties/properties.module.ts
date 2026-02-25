import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertiesController } from './presentation/controllers/properties.controller';
import { PropertyValuesController } from './presentation/controllers/property-values.controller';
import { PropertyDependenciesController } from './presentation/property-dependencies.controller';

// UseCases
import { CreatePropertyUseCase } from './application/use-cases/create-property.use-case';
import { GetPropertyByIdUseCase } from './application/use-cases/get-property-by-id.use-case';
import { GetAllActivePropertiesUseCase } from './application/use-cases/get-all-active-properties.use-case';
import { GetAllPropertiesUseCase } from './application/use-cases/get-all-properties.use-case';
import { UpdatePropertyUseCase } from './application/use-cases/update-property.use-case';
import { ActivatePropertyUseCase } from './application/use-cases/activate-property.use-case';
import { DeactivatePropertyUseCase } from './application/use-cases/deactivate-property.use-case';
import { CreatePropertyValueUseCase } from './application/use-cases/create-property-value.use-case';
import { GetPropertyValuesByPropertyIdUseCase } from './application/use-cases/get-property-values-by-property-id.use-case';
import { DeletePropertyDependencyUseCase } from './application/use-cases/delete-property-dependency.use-case';
import { CreatePropertyDependencyUseCase } from './application/use-cases/create-property-dependency.use-case';
import { GetDependenciesForPropertyUseCase } from './application/use-cases/get-dependencies-for-property.use-case';
import { UpdatePropertyValueUseCase } from './application/use-cases/update-property-value.use-case';
import { DeletePropertyValueUseCase } from './application/use-cases/delete-property-value.use-case';


// Repositories
import { PropertyRepository } from './infrastructure/persistence/property.repository';
import { PropertyValueRepository } from './infrastructure/persistence/property-value.repository';
import { PropertyDependencyRepository } from './infrastructure/persistence/property-dependency.repository';
import { PROPERTY_REPOSITORY, PROPERTY_VALUE_REPOSITORY, PROPERTY_DEPENDENCY_REPOSITORY } from './domain/repositories/injection-tokens';

// Entities
import { PropertyEntity } from './infrastructure/persistence/property.entity';
import { PropertyValueEntity } from './infrastructure/persistence/property-value.entity';
import { PropertyDependencyEntity } from './infrastructure/persistence/property-dependency.entity';

import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertyEntity, PropertyValueEntity, PropertyDependencyEntity]),
    PricingModule,
  ],
  controllers: [PropertiesController, PropertyValuesController, PropertyDependenciesController],
  providers: [
    // UseCases
    CreatePropertyUseCase,
    GetPropertyByIdUseCase,
    GetAllActivePropertiesUseCase,
    GetAllPropertiesUseCase,
    UpdatePropertyUseCase,
    ActivatePropertyUseCase,
    DeactivatePropertyUseCase,
    CreatePropertyValueUseCase,
    GetPropertyValuesByPropertyIdUseCase,
    DeletePropertyDependencyUseCase,
    CreatePropertyDependencyUseCase,
    GetDependenciesForPropertyUseCase,
    UpdatePropertyValueUseCase,
    DeletePropertyValueUseCase,


    // Repositories
    {
      provide: PROPERTY_REPOSITORY,
      useClass: PropertyRepository,
    },
    {
      provide: PROPERTY_VALUE_REPOSITORY,
      useClass: PropertyValueRepository,
    },

    {
      provide: PROPERTY_DEPENDENCY_REPOSITORY,
      useClass: PropertyDependencyRepository,
    },
  ],
  exports: [
    CreatePropertyUseCase,
    GetPropertyByIdUseCase,
    GetAllActivePropertiesUseCase,
    GetAllPropertiesUseCase,
    UpdatePropertyUseCase,
    ActivatePropertyUseCase,
    DeactivatePropertyUseCase,
  ],
})
export class PropertiesModule { }

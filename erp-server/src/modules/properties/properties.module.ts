import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertiesController } from './presentation/controllers/properties.controller';
import { PropertyValuesController } from './presentation/controllers/property-values.controller';

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

// Repositories
import { PropertyRepository } from './infrastructure/persistence/property.repository';
import { PropertyValueRepository } from './infrastructure/persistence/property-value.repository';
import { PROPERTY_REPOSITORY, PROPERTY_VALUE_REPOSITORY } from './domain/repositories/injection-tokens';

// Entities
import { PropertyEntity } from './infrastructure/persistence/property.entity';
import { PropertyValueEntity } from './infrastructure/persistence/property-value.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertyEntity, PropertyValueEntity]),
  ],
  controllers: [PropertiesController, PropertyValuesController],
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
    
    // Repositories
    {
      provide: PROPERTY_REPOSITORY,
      useClass: PropertyRepository,
    },
    {
      provide: PROPERTY_VALUE_REPOSITORY,
      useClass: PropertyValueRepository,
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
export class PropertiesModule {}

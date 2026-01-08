import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyEntity } from './infrastructure/persistence/property.entity';
import { PropertyDependencyEntity } from './infrastructure/persistence/property-dependency.entity';
import { PropertyRepository } from './infrastructure/persistence/property.repository';
import { PropertyDependencyRepository } from './infrastructure/persistence/property-dependency.repository';
import {
  PROPERTY_REPOSITORY,
  PROPERTY_DEPENDENCY_REPOSITORY,
} from './domain/repositories/injection-tokens';

// Use cases
import { CreatePropertyUseCase } from './application/use-cases/create-property.use-case';
import { GetPropertyByIdUseCase } from './application/use-cases/get-property-by-id.use-case';
import { GetAllActivePropertiesUseCase } from './application/use-cases/get-all-active-properties.use-case';
import { UpdatePropertyUseCase } from './application/use-cases/update-property.use-case';
import { ActivatePropertyUseCase } from './application/use-cases/activate-property.use-case';
import { DeactivatePropertyUseCase } from './application/use-cases/deactivate-property.use-case';
import { CreatePropertyDependencyUseCase } from './application/use-cases/create-property-dependency.use-case';
import { GetDependenciesForPropertyUseCase } from './application/use-cases/get-dependencies-for-property.use-case';

// Domain service
import { PropertyDependencyResolverService } from './domain/services/property-dependency-resolver.service';

// Controllers
import { PropertiesController } from './presentation/properties.controller';
import { PropertyDependenciesController } from './presentation/property-dependencies.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertyEntity, PropertyDependencyEntity]),
  ],
  providers: [
    // Repositories
    {
      provide: PROPERTY_REPOSITORY,
      useClass: PropertyRepository,
    },
    {
      provide: PROPERTY_DEPENDENCY_REPOSITORY,
      useClass: PropertyDependencyRepository,
    },

    // Use cases
    CreatePropertyUseCase,
    GetPropertyByIdUseCase,
    GetAllActivePropertiesUseCase,
    UpdatePropertyUseCase,
    ActivatePropertyUseCase,
    DeactivatePropertyUseCase,
    CreatePropertyDependencyUseCase,
    GetDependenciesForPropertyUseCase,

    // Domain services
    PropertyDependencyResolverService,
  ],
  controllers: [PropertiesController, PropertyDependenciesController],
  exports: [
    PROPERTY_REPOSITORY,
    PROPERTY_DEPENDENCY_REPOSITORY,
    PropertyDependencyResolverService,
  ],
})
export class PropertiesModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComponentGenerationService } from './domain/services/component-generation.service';
import { OrderItemComponentEntity } from './infrastructure/persistence/order-item-component.entity';
import { OperationMaterialEntity } from './infrastructure/persistence/operation-material.entity';
import { WorkOrderDefectEntity } from './infrastructure/persistence/work-order-defect.entity';
import { TechnologicalRouteEntity } from './infrastructure/persistence/entities/technological-route.entity';
import { RouteStepEntity } from './infrastructure/persistence/entities/route-step.entity';
import { ProductionDepartmentEntity } from './infrastructure/persistence/entities/production-department.entity';
import { DepartmentOperationEntity } from './infrastructure/persistence/entities/department-operation.entity';
import { OperationRateEntity } from './infrastructure/persistence/entities/operation-rate.entity';
import { OperationEntity } from './infrastructure/persistence/entities/operation.entity';
import { TECHNOLOGICAL_ROUTE_REPOSITORY } from './domain/repositories/technological-route.repository.interface';
import { TechnologicalRouteRepository } from './infrastructure/repositories/technological-route.repository';
import { PRODUCTION_DEPARTMENT_REPOSITORY } from './domain/repositories/production-department.repository.interface';
import { ProductionDepartmentRepository } from './infrastructure/repositories/production-department.repository';
import { OPERATION_RATE_REPOSITORY } from './domain/repositories/operation-rate.repository.interface';
import { OperationRateRepository } from './infrastructure/repositories/operation-rate.repository';
import { OPERATION_REPOSITORY } from './domain/repositories/operation.repository.interface';
import { OperationRepository } from './infrastructure/repositories/operation.repository';
import { ORDER_ITEM_COMPONENT_REPOSITORY } from './domain/repositories/order-item-component.repository.interface';
import { OrderItemComponentRepository } from './infrastructure/repositories/order-item-component.repository';
import { ProductComponentSchemaEntity } from './infrastructure/persistence/entities/product-component-schema.entity';
import { PRODUCT_COMPONENT_SCHEMA_REPOSITORY } from './domain/repositories/product-component-schema.repository.interface';
import { ProductComponentSchemaRepository } from './infrastructure/repositories/product-component-schema.repository';
import { CreateProductComponentSchemaUseCase } from './application/use-cases/create-product-component-schema.use-case';
import { GetProductComponentSchemasUseCase } from './application/use-cases/get-product-component-schemas.use-case';
import { DeleteProductComponentSchemaUseCase } from './application/use-cases/delete-product-component-schema.use-case';
import { ProductComponentSchemaController } from './presentation/controllers/product-component-schema.controller';
import { RouteStepMaterialEntity } from './infrastructure/persistence/entities/route-step-material.entity';
import { CreateTechnologicalRouteUseCase } from './application/use-cases/create-technological-route.use-case';
import { GetTechnologicalRouteUseCase } from './application/use-cases/get-technological-route.use-case';
import { TechnologicalRouteController } from './presentation/controllers/technological-route.controller';
import { OperationController } from './presentation/controllers/operation.controller';
import { DepartmentOperationController } from './presentation/controllers/department-operation.controller';
import { CreateOperationUseCase } from './application/use-cases/create-operation.use-case';
import { UpdateOperationUseCase } from './application/use-cases/update-operation.use-case';
import { CreateDepartmentOperationUseCase } from './application/use-cases/create-department-operation.use-case';
import { UpdateDepartmentOperationUseCase } from './application/use-cases/update-department-operation.use-case';
import { CreateProductionDepartmentUseCase } from './application/use-cases/create-production-department.use-case';
import { UpdateProductionDepartmentUseCase } from './application/use-cases/update-production-department.use-case';
import { DepartmentOperationRepository } from './infrastructure/repositories/department-operation.repository';
import { ProductionDepartmentController } from './presentation/controllers/production-department.controller';
import { DEPARTMENT_OPERATION_REPOSITORY } from './domain/repositories/department-operation.repository.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderItemComponentEntity,
      OperationMaterialEntity,
      WorkOrderDefectEntity,
      TechnologicalRouteEntity,
      RouteStepEntity,
      RouteStepMaterialEntity,
      ProductionDepartmentEntity,
      DepartmentOperationEntity,
      OperationRateEntity,
      OperationEntity,
      ProductComponentSchemaEntity,
    ]),
  ],
  controllers: [
    ProductComponentSchemaController,
    TechnologicalRouteController,
    OperationController,
    DepartmentOperationController,
    ProductionDepartmentController,
  ],
  providers: [
    ComponentGenerationService,
    CreateProductComponentSchemaUseCase,
    GetProductComponentSchemasUseCase,
    DeleteProductComponentSchemaUseCase,
    CreateTechnologicalRouteUseCase,
    GetTechnologicalRouteUseCase,
    CreateOperationUseCase,
    UpdateOperationUseCase,
    CreateDepartmentOperationUseCase,
    UpdateDepartmentOperationUseCase,
    CreateProductionDepartmentUseCase,
    UpdateProductionDepartmentUseCase,
    {
      provide: TECHNOLOGICAL_ROUTE_REPOSITORY,
      useClass: TechnologicalRouteRepository,
    },
    {
      provide: PRODUCTION_DEPARTMENT_REPOSITORY,
      useClass: ProductionDepartmentRepository,
    },
    {
      provide: OPERATION_RATE_REPOSITORY,
      useClass: OperationRateRepository,
    },
    {
      provide: OPERATION_REPOSITORY,
      useClass: OperationRepository,
    },
    {
      provide: ORDER_ITEM_COMPONENT_REPOSITORY,
      useClass: OrderItemComponentRepository,
    },
    {
      provide: PRODUCT_COMPONENT_SCHEMA_REPOSITORY,
      useClass: ProductComponentSchemaRepository,
    },
    {
      provide: DEPARTMENT_OPERATION_REPOSITORY,
      useClass: DepartmentOperationRepository,
    },
  ],
  exports: [
    ComponentGenerationService,
    TECHNOLOGICAL_ROUTE_REPOSITORY,
    PRODUCTION_DEPARTMENT_REPOSITORY,
    OPERATION_RATE_REPOSITORY,
    OPERATION_REPOSITORY,
    ORDER_ITEM_COMPONENT_REPOSITORY,
    PRODUCT_COMPONENT_SCHEMA_REPOSITORY,
    DEPARTMENT_OPERATION_REPOSITORY,
  ],
})
export class ProductionModule { }
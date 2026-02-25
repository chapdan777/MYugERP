import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrderEntity } from './infrastructure/persistence/entities/work-order.entity';
import { WorkOrderItemEntity } from './infrastructure/persistence/entities/work-order-item.entity';
import { WorkOrderStatusOrmEntity } from './infrastructure/persistence/entities/work-order-status.entity';
import { WorkOrderRepository } from './infrastructure/repositories/work-order.repository';
import { WorkOrderStatusRepository } from './infrastructure/repositories/work-order-status.repository';
import { WORK_ORDER_REPOSITORY } from './domain/repositories/work-order.repository.interface';
import { WORK_ORDER_STATUS_REPOSITORY } from './domain/repositories/work-order-status.repository.interface';
import { WorkOrderGenerationService } from './domain/services/work-order-generation.service';
import { WorkOrderStateMachineService } from './domain/services/work-order-state-machine.service';
import { WorkOrderPriorityService } from './domain/services/work-order-priority.service';
import { WorkOrderGroupingService } from './domain/services/work-order-grouping.service';
import { WorkOrderController } from './presentation/controllers/work-order.controller';
import { WorkOrderStatusController } from './presentation/controllers/work-order-status.controller';
import { CncController } from './presentation/controllers/cnc.controller';
import { CncDataService } from './domain/services/cnc-data.service';
import { ProductionModule } from '../production/production.module';
import { CommonModule } from '../common/common.module';
import { GenerateWorkOrdersUseCase } from './application/use-cases/generate-work-orders.use-case';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            WorkOrderEntity,
            WorkOrderItemEntity,
            WorkOrderStatusOrmEntity,
        ]),
        CommonModule,
        ProductionModule,
        OrdersModule,
        ProductsModule,
    ],
    controllers: [
        WorkOrderController,
        WorkOrderStatusController,
        CncController,
    ],
    providers: [
        WorkOrderGenerationService,
        CncDataService,
        WorkOrderStateMachineService,
        WorkOrderPriorityService,
        WorkOrderGroupingService,
        GenerateWorkOrdersUseCase,
        {
            provide: WORK_ORDER_REPOSITORY,
            useClass: WorkOrderRepository,
        },
        {
            provide: WORK_ORDER_STATUS_REPOSITORY,
            useClass: WorkOrderStatusRepository,
        },
    ],
    exports: [
        WorkOrderGenerationService,
        WorkOrderStateMachineService,
        WORK_ORDER_STATUS_REPOSITORY,
    ],
})
export class WorkOrdersModule { }

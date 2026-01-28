import { Module } from '@nestjs/common';
import { OrdersController } from './presentation/controllers/orders.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './infrastructure/persistence/order.entity';
import { OrderSectionEntity } from './infrastructure/persistence/order-section.entity';
import { OrderItemEntity } from './infrastructure/persistence/order-item.entity';
import { PropertyInOrderEntity } from './infrastructure/persistence/property-in-order.entity';
import { OrderRepository } from './infrastructure/persistence/order.repository';
import { CreateOrderUseCase } from './application/use-cases/create-order.use-case';
import { ORDER_REPOSITORY } from './domain/repositories/order.repository.interface';
import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      OrderSectionEntity,
      OrderItemEntity,
      PropertyInOrderEntity
    ]),
    PricingModule,
  ],
  controllers: [OrdersController],
  providers: [
    {
      provide: ORDER_REPOSITORY,
      useClass: OrderRepository,
    },
    CreateOrderUseCase,
  ],
  exports: [
    ORDER_REPOSITORY,
  ]
})
export class OrdersModule { }
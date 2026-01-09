import { Module } from '@nestjs/common';
import { WorkOrdersController } from './presentation/controllers/work-orders.controller';

@Module({
  imports: [],
  controllers: [WorkOrdersController],
  providers: [],
})
export class ProductionModule {}
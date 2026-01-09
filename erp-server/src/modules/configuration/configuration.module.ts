import { Module } from '@nestjs/common';
import { OrderTemplatesController } from './presentation/controllers/order-templates.controller';

@Module({
  imports: [],
  controllers: [OrderTemplatesController],
  providers: [],
})
export class ConfigurationModule {}

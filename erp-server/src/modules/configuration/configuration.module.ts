import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderTemplateEntity } from './infrastructure/persistence/order-template.entity';
import { OrderSectionTemplateEntity } from './infrastructure/persistence/order-section-template.entity';
import { OrderTemplateRepository } from './infrastructure/persistence/order-template.repository';
import { OrderSectionTemplateRepository } from './infrastructure/persistence/order-section-template.repository';
import {
  ORDER_TEMPLATE_REPOSITORY,
  ORDER_SECTION_TEMPLATE_REPOSITORY,
} from './domain/repositories/injection-tokens';

// Use cases
import { CreateOrderTemplateUseCase } from './application/use-cases/create-order-template.use-case';
import { GetOrderTemplateByIdUseCase } from './application/use-cases/get-order-template-by-id.use-case';
import { GetAllActiveOrderTemplatesUseCase } from './application/use-cases/get-all-active-order-templates.use-case';
import { AddSectionToTemplateUseCase } from './application/use-cases/add-section-to-template.use-case';

// Controller
import { OrderTemplatesController } from './presentation/order-templates.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderTemplateEntity, OrderSectionTemplateEntity]),
  ],
  providers: [
    // Repositories
    {
      provide: ORDER_TEMPLATE_REPOSITORY,
      useClass: OrderTemplateRepository,
    },
    {
      provide: ORDER_SECTION_TEMPLATE_REPOSITORY,
      useClass: OrderSectionTemplateRepository,
    },

    // Use cases
    CreateOrderTemplateUseCase,
    GetOrderTemplateByIdUseCase,
    GetAllActiveOrderTemplatesUseCase,
    AddSectionToTemplateUseCase,
  ],
  controllers: [OrderTemplatesController],
  exports: [ORDER_TEMPLATE_REPOSITORY, ORDER_SECTION_TEMPLATE_REPOSITORY],
})
export class ConfigurationModule {}

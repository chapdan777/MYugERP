import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceModifierEntity } from './infrastructure/persistence/price-modifier.entity';
import { PriceModifierRepository } from './infrastructure/persistence/price-modifier.repository';
import { PRICE_MODIFIER_REPOSITORY } from './domain/repositories/injection-tokens';
import { PriceModifiersController } from './presentation/controllers/price-modifiers.controller';

import {
  CreatePriceModifierUseCase,
  GetPriceModifierByIdUseCase,
  GetPriceModifierByCodeUseCase,
  GetAllActivePriceModifiersUseCase,
  UpdatePriceModifierUseCase,
  DeletePriceModifierUseCase,
  ActivatePriceModifierUseCase,
  DeactivatePriceModifierUseCase,
  CalculatePriceUseCase,
} from './application/use-cases';
import { ProductPriceCalculatorService } from './domain/services/product-price-calculator.service';

import { PricingController } from './presentation/controllers/pricing.controller';

import { ProductsModule } from '../products/products.module';
import { ProductionModule } from '../production/production.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PriceModifierEntity]),
    forwardRef(() => ProductsModule),
    forwardRef(() => ProductionModule),
  ],
  controllers: [PriceModifiersController, PricingController],
  providers: [
    // Repository
    {
      provide: PRICE_MODIFIER_REPOSITORY,
      useClass: PriceModifierRepository,
    },
    // Use Cases
    CreatePriceModifierUseCase,
    GetPriceModifierByIdUseCase,
    GetPriceModifierByCodeUseCase,
    GetAllActivePriceModifiersUseCase,
    UpdatePriceModifierUseCase,
    DeletePriceModifierUseCase,
    ActivatePriceModifierUseCase,
    DeactivatePriceModifierUseCase,
    CalculatePriceUseCase,
    // Services
    ProductPriceCalculatorService,
  ],
  exports: [
    PRICE_MODIFIER_REPOSITORY,
    CalculatePriceUseCase,
  ],
})
export class PricingModule { }

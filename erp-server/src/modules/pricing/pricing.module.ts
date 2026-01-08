import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceModifierEntity } from './infrastructure/persistence/price-modifier.entity';
import { PriceModifierRepository } from './infrastructure/persistence/price-modifier.repository';
import { PRICE_MODIFIER_REPOSITORY } from './domain/repositories/injection-tokens';

// Use cases
import { CreatePriceModifierUseCase } from './application/use-cases/create-price-modifier.use-case';
import { GetPriceModifierByIdUseCase } from './application/use-cases/get-price-modifier-by-id.use-case';
import { GetAllActivePriceModifiersUseCase } from './application/use-cases/get-all-active-price-modifiers.use-case';
import { UpdatePriceModifierUseCase } from './application/use-cases/update-price-modifier.use-case';
import { ActivatePriceModifierUseCase } from './application/use-cases/activate-price-modifier.use-case';
import { DeactivatePriceModifierUseCase } from './application/use-cases/deactivate-price-modifier.use-case';

// Domain service
import { PriceCalculationService } from './domain/services/price-calculation.service';

// Controller
import { PriceModifiersController } from './presentation/price-modifiers.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PriceModifierEntity]),
  ],
  providers: [
    // Repository
    {
      provide: PRICE_MODIFIER_REPOSITORY,
      useClass: PriceModifierRepository,
    },

    // Use cases
    CreatePriceModifierUseCase,
    GetPriceModifierByIdUseCase,
    GetAllActivePriceModifiersUseCase,
    UpdatePriceModifierUseCase,
    ActivatePriceModifierUseCase,
    DeactivatePriceModifierUseCase,

    // Domain service
    PriceCalculationService,
  ],
  controllers: [PriceModifiersController],
  exports: [
    PRICE_MODIFIER_REPOSITORY,
    PriceCalculationService,
  ],
})
export class PricingModule {}

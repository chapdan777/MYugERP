import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([PriceModifierEntity]),
  ],
  controllers: [PriceModifiersController],
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
  ],
})
export class PricingModule {}

import { Module } from '@nestjs/common';
import { PriceModifiersController } from './presentation/controllers/price-modifiers.controller';

@Module({
  imports: [],
  controllers: [PriceModifiersController],
  providers: [],
})
export class PricingModule {}

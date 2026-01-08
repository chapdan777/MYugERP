import { Injectable, Inject } from '@nestjs/common';
import { PRICE_MODIFIER_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { IPriceModifierRepository } from '../../domain/repositories/price-modifier.repository.interface';
import { PriceModifier } from '../../domain/entities/price-modifier.entity';

@Injectable()
export class GetAllActivePriceModifiersUseCase {
  constructor(
    @Inject(PRICE_MODIFIER_REPOSITORY)
    private readonly modifierRepository: IPriceModifierRepository,
  ) {}

  async execute(): Promise<PriceModifier[]> {
    return await this.modifierRepository.findAllActive();
  }
}

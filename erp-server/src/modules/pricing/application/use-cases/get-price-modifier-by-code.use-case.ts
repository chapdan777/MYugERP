import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PRICE_MODIFIER_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { IPriceModifierRepository } from '../../domain/repositories/price-modifier.repository.interface';
import { PriceModifier } from '../../domain/entities/price-modifier.entity';

@Injectable()
export class GetPriceModifierByCodeUseCase {
  constructor(
    @Inject(PRICE_MODIFIER_REPOSITORY)
    private readonly modifierRepository: IPriceModifierRepository,
  ) {}

  async execute(code: string): Promise<PriceModifier> {
    const modifier = await this.modifierRepository.findByCode(code);
    
    if (!modifier) {
      throw new NotFoundException(`Модификатор с кодом "${code}" не найден`);
    }

    return modifier;
  }
}
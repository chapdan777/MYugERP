import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PRICE_MODIFIER_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { IPriceModifierRepository } from '../../domain/repositories/price-modifier.repository.interface';
import { PriceModifier } from '../../domain/entities/price-modifier.entity';

@Injectable()
export class DeactivatePriceModifierUseCase {
  constructor(
    @Inject(PRICE_MODIFIER_REPOSITORY)
    private readonly modifierRepository: IPriceModifierRepository,
  ) {}

  async execute(id: number): Promise<PriceModifier> {
    const modifier = await this.modifierRepository.findById(id);
    
    if (!modifier) {
      throw new NotFoundException(`Модификатор с ID ${id} не найден`);
    }

    modifier.deactivate();
    return await this.modifierRepository.save(modifier);
  }
}

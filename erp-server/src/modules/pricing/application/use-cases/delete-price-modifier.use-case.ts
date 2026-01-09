import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PRICE_MODIFIER_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { IPriceModifierRepository } from '../../domain/repositories/price-modifier.repository.interface';

@Injectable()
export class DeletePriceModifierUseCase {
  constructor(
    @Inject(PRICE_MODIFIER_REPOSITORY)
    private readonly modifierRepository: IPriceModifierRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const modifier = await this.modifierRepository.findById(id);
    
    if (!modifier) {
      throw new NotFoundException(`Модификатор с ID ${id} не найден`);
    }

    await this.modifierRepository.delete(id);
  }
}
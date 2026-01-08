import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PRICE_MODIFIER_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { IPriceModifierRepository } from '../../domain/repositories/price-modifier.repository.interface';
import { PriceModifier } from '../../domain/entities/price-modifier.entity';

export interface UpdatePriceModifierDto {
  name?: string;
  value?: number;
  propertyId?: number | null;
  propertyValue?: string | null;
  priority?: number;
}

@Injectable()
export class UpdatePriceModifierUseCase {
  constructor(
    @Inject(PRICE_MODIFIER_REPOSITORY)
    private readonly modifierRepository: IPriceModifierRepository,
  ) {}

  async execute(id: number, dto: UpdatePriceModifierDto): Promise<PriceModifier> {
    const modifier = await this.modifierRepository.findById(id);
    
    if (!modifier) {
      throw new NotFoundException(`Модификатор с ID ${id} не найден`);
    }

    // Обновление через доменный метод updateInfo
    modifier.updateInfo({
      name: dto.name,
      value: dto.value,
      propertyId: dto.propertyId,
      propertyValue: dto.propertyValue,
      priority: dto.priority,
    });

    return await this.modifierRepository.save(modifier);
  }
}

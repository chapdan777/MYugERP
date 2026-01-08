import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { PRICE_MODIFIER_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { IPriceModifierRepository } from '../../domain/repositories/price-modifier.repository.interface';
import { PriceModifier } from '../../domain/entities/price-modifier.entity';
import { ModifierType } from '../../domain/enums/modifier-type.enum';

export interface CreatePriceModifierDto {
  name: string;
  code: string;
  modifierType: ModifierType;
  value: number;
  propertyId?: number;
  propertyValue?: string;
  priority?: number;
}

@Injectable()
export class CreatePriceModifierUseCase {
  constructor(
    @Inject(PRICE_MODIFIER_REPOSITORY)
    private readonly modifierRepository: IPriceModifierRepository,
  ) {}

  async execute(dto: CreatePriceModifierDto): Promise<PriceModifier> {
    // Проверка уникальности кода
    const exists = await this.modifierRepository.existsByCode(dto.code);
    if (exists) {
      throw new ConflictException(`Модификатор с кодом "${dto.code}" уже существует`);
    }

    // Создание модификатора через фабричный метод
    const modifier = PriceModifier.create({
      name: dto.name,
      code: dto.code,
      modifierType: dto.modifierType,
      value: dto.value,
      propertyId: dto.propertyId ?? null,
      propertyValue: dto.propertyValue ?? null,
      priority: dto.priority ?? 0,
    });

    return await this.modifierRepository.save(modifier);
  }
}

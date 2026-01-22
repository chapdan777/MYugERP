import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PROPERTY_VALUE_REPOSITORY } from '../../domain/repositories/injection-tokens';
import type { IPropertyValueRepository } from '../../domain/repositories/property-value.repository.interface';
import { PropertyValue } from '../../domain/entities/property-value.entity';

import type { IPropertyRepository } from '../../domain/repositories/property.repository.interface';
import { PROPERTY_REPOSITORY } from '../../domain/repositories/injection-tokens';

export interface CreatePropertyValueDto {
  propertyId: number;
  value: string;
  priceModifierId?: number | null;
  displayOrder?: number;
}

@Injectable()
export class CreatePropertyValueUseCase {
  constructor(
    @Inject(PROPERTY_VALUE_REPOSITORY)
    private readonly propertyValueRepository: IPropertyValueRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
  ) {}

  async execute(dto: CreatePropertyValueDto): Promise<PropertyValue> {
    // Проверяем, что свойство существует
    const property = await this.propertyRepository.findById(dto.propertyId);
    if (!property) {
      throw new NotFoundException(`Свойство с ID ${dto.propertyId} не найдено`);
    }

    // Проверяем, что значение не дублируется для этого свойства
    const existingValue = await this.propertyValueRepository.findByPropertyIdAndValue(
      dto.propertyId,
      dto.value
    );
    if (existingValue) {
      throw new Error(`Значение '${dto.value}' уже существует для свойства с ID ${dto.propertyId}`);
    }

    const propertyValue = PropertyValue.create({
      propertyId: dto.propertyId,
      value: dto.value,
      priceModifierId: dto.priceModifierId,
      displayOrder: dto.displayOrder ?? 0,
    });

    return await this.propertyValueRepository.save(propertyValue);
  }
}
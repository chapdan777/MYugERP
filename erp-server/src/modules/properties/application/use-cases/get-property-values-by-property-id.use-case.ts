import { Injectable, Inject } from '@nestjs/common';
import { PROPERTY_VALUE_REPOSITORY } from '../../domain/repositories/injection-tokens';
import type { IPropertyValueRepository } from '../../domain/repositories/property-value.repository.interface';
import { PropertyValue } from '../../domain/entities/property-value.entity';

@Injectable()
export class GetPropertyValuesByPropertyIdUseCase {
  constructor(
    @Inject(PROPERTY_VALUE_REPOSITORY)
    private readonly propertyValueRepository: IPropertyValueRepository,
  ) {}

  async execute(propertyId: number): Promise<PropertyValue[]> {
    return await this.propertyValueRepository.findByPropertyId(propertyId);
  }
}
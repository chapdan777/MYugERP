import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PROPERTY_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { IPropertyRepository } from '../../domain/repositories/property.repository.interface';
import { Property } from '../../domain/entities/property.entity';

@Injectable()
export class DeactivatePropertyUseCase {
  constructor(
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
  ) {}

  async execute(id: number): Promise<Property> {
    const property = await this.propertyRepository.findById(id);
    
    if (!property) {
      throw new NotFoundException(`Свойство с ID ${id} не найдено`);
    }

    property.deactivate();
    return await this.propertyRepository.save(property);
  }
}

import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PROPERTY_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { IPropertyRepository } from '../../domain/repositories/property.repository.interface';
import { Property } from '../../domain/entities/property.entity';

export interface UpdatePropertyDto {
  name?: string;
  possibleValues?: string[];
  defaultValue?: string;
  isRequired?: boolean;
  displayOrder?: number;
}

@Injectable()
export class UpdatePropertyUseCase {
  constructor(
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
  ) {}

  async execute(id: number, dto: UpdatePropertyDto): Promise<Property> {
    const property = await this.propertyRepository.findById(id);
    
    if (!property) {
      throw new NotFoundException(`Свойство с ID ${id} не найдено`);
    }

    // Обновление через доменный метод updateInfo
    property.updateInfo({
      name: dto.name,
      possibleValues: dto.possibleValues,
      defaultValue: dto.defaultValue,
      isRequired: dto.isRequired,
      displayOrder: dto.displayOrder,
    });

    return await this.propertyRepository.save(property);
  }
}

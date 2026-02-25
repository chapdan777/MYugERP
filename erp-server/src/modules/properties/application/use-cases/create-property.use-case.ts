import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { PROPERTY_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { IPropertyRepository } from '../../domain/repositories/property.repository.interface';
import { Property } from '../../domain/entities/property.entity';
import { PropertyDataType } from '../../domain/enums/property-data-type.enum';

export interface CreatePropertyDto {
  code: string;
  name: string;
  dataType: PropertyDataType;
  possibleValues?: string[];
  defaultValue?: string;
  isRequired: boolean;
  displayOrder: number;
  variableName?: string;
}

@Injectable()
export class CreatePropertyUseCase {
  constructor(
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
  ) { }

  async execute(dto: CreatePropertyDto): Promise<Property> {
    // Проверка уникальности кода
    const exists = await this.propertyRepository.existsByCode(dto.code);
    if (exists) {
      throw new ConflictException(`Свойство с кодом "${dto.code}" уже существует`);
    }

    // Создание свойства через фабричный метод
    const property = Property.create({
      code: dto.code,
      name: dto.name,
      dataType: dto.dataType,
      possibleValues: dto.possibleValues,
      defaultValue: dto.defaultValue,
      isRequired: dto.isRequired,
      displayOrder: dto.displayOrder,
      variableName: dto.variableName,
    });

    // Сохранение
    return await this.propertyRepository.save(property);
  }
}

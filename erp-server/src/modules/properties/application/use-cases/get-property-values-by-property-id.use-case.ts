import { Injectable, Inject } from '@nestjs/common';
import { PROPERTY_VALUE_REPOSITORY, PROPERTY_REPOSITORY } from '../../domain/repositories/injection-tokens';
import type { IPropertyValueRepository } from '../../domain/repositories/property-value.repository.interface';
import type { IPropertyRepository } from '../../domain/repositories/property.repository.interface';
import { PropertyValue } from '../../domain/entities/property-value.entity';
import { PropertyDataType } from '../../domain/enums/property-data-type.enum';

@Injectable()
export class GetPropertyValuesByPropertyIdUseCase {
  constructor(
    @Inject(PROPERTY_VALUE_REPOSITORY)
    private readonly propertyValueRepository: IPropertyValueRepository,
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
  ) { }

  async execute(propertyId: number): Promise<PropertyValue[]> {
    const valuesFromDb = await this.propertyValueRepository.findByPropertyId(propertyId);

    // Получаем саму настройку свойства для проверки JSON-значений и типа
    const property = await this.propertyRepository.findById(propertyId);
    if (!property) {
      return valuesFromDb;
    }

    const result = [...valuesFromDb];

    // 1. Добавляем значения из JSON possibleValues (для обратной совместимости)
    const jsonValues = property.getPossibleValuesArray();
    if (jsonValues && jsonValues.length > 0) {
      for (const val of jsonValues) {
        // Если такого значения еще нет в таблице property_values, добавим его как "виртуальное"
        const alreadyExists = result.some(pv => pv.getValue() === val);
        if (!alreadyExists) {
          result.push(PropertyValue.restore({
            id: -Math.floor(Math.random() * 1000000) - 1, // Временный отрицательный ID для UI
            propertyId: propertyId,
            value: val,
            priceModifierId: null,
            displayOrder: result.length,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));
        }
      }
    }

    // 2. Если тип логический, добавляем недостающие стандартные значения (для поддержки наценок)
    if (property.getDataType() === PropertyDataType.BOOLEAN) {
      const standardPairs = [
        { value: 'Да', alt: 'Yes' },
        { value: 'Нет', alt: 'No' }
      ];

      standardPairs.forEach((pair, index) => {
        const exists = result.some(pv =>
          pv.getValue().toLowerCase() === pair.value.toLowerCase() ||
          pv.getValue().toLowerCase() === pair.alt.toLowerCase()
        );

        if (!exists) {
          result.push(PropertyValue.restore({
            id: -(index + 200), // Временный ID, отличный от других
            propertyId: propertyId,
            value: pair.value,
            priceModifierId: null,
            displayOrder: result.length,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));
        }
      });
    }

    return result;
  }
}
import { Property } from '../../domain/entities/property.entity';
import { PropertyEntity } from './property.entity';
import { PropertyDataType } from '../../domain/enums/property-data-type.enum';

/**
 * Mapper для преобразования между Property domain и PropertyEntity persistence
 */
export class PropertyMapper {
  static toDomain(entity: PropertyEntity): Property {
    let possibleValues = entity.possibleValues;

    // Если есть связанные значения, используем их приоритетно
    if (entity.values && entity.values.length > 0) {
      const activeValues = entity.values
        .filter(v => v.isActive)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(v => v.value);

      if (activeValues.length > 0) {
        possibleValues = JSON.stringify(activeValues);
      }
    }

    return Property.restore({
      id: entity.id,
      name: entity.name,
      code: entity.code,
      dataType: entity.dataType as PropertyDataType,
      possibleValues: possibleValues,
      defaultValue: entity.defaultValue,
      isRequired: entity.isRequired,
      displayOrder: entity.displayOrder,
      isActive: entity.isActive,
      variableName: entity.variableName,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPersistence(domain: Property): PropertyEntity {
    const entity = new PropertyEntity();

    if (domain.getId()) {
      entity.id = domain.getId()!;
    }

    entity.name = domain.getName();
    entity.code = domain.getCode();
    entity.dataType = domain.getDataType();
    entity.possibleValues = domain.getPossibleValues();
    entity.defaultValue = domain.getDefaultValue();
    entity.isRequired = domain.getIsRequired();
    entity.displayOrder = domain.getDisplayOrder();
    entity.isActive = domain.getIsActive();
    entity.variableName = domain.getVariableName();
    entity.createdAt = domain.getCreatedAt();
    entity.updatedAt = domain.getUpdatedAt();

    return entity;
  }

  static toDomainList(entities: PropertyEntity[]): Property[] {
    return entities.map(entity => PropertyMapper.toDomain(entity));
  }
}

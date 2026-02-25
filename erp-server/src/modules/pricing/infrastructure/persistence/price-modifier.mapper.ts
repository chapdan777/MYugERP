import { PriceModifier } from '../../domain/entities/price-modifier.entity';
import { PriceModifierEntity } from './price-modifier.entity';

/**
 * Mapper для преобразования между доменной моделью и persistence моделью
 */
export class PriceModifierMapper {
  /**
   * Преобразование из persistence entity в domain entity
   */
  static toDomain(entity: PriceModifierEntity): PriceModifier {
    return PriceModifier.restore({
      id: entity.id,
      name: entity.name,
      code: entity.code,
      modifierType: entity.modifierType,
      value: Number(entity.value), // Конвертируем DECIMAL (строку) в число
      propertyId: entity.propertyId,
      propertyValue: entity.propertyValue,
      conditionExpression: entity.conditionExpression,
      priority: entity.priority,
      isActive: entity.isActive,
      startDate: entity.startDate,
      endDate: entity.endDate,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  /**
   * Преобразование из domain entity в persistence entity
   */
  static toPersistence(domain: PriceModifier): PriceModifierEntity {
    const entity = new PriceModifierEntity();
    
    if (domain.getId()) {
      entity.id = domain.getId()!;
    }
    
    entity.name = domain.getName();
    entity.code = domain.getCode();
    entity.modifierType = domain.getModifierType();
    entity.value = domain.getValue();
    entity.propertyId = domain.getPropertyId();
    entity.propertyValue = domain.getPropertyValue();
    entity.priority = domain.getPriority();
    entity.isActive = domain.getIsActive();
    entity.startDate = domain.getStartDate();
    entity.endDate = domain.getEndDate();
    entity.createdAt = domain.getCreatedAt();
    entity.updatedAt = domain.getUpdatedAt();
    
    return entity;
  }

  /**
   * Преобразование списка
   */
  static toDomainList(entities: PriceModifierEntity[]): PriceModifier[] {
    return entities.map(entity => this.toDomain(entity));
  }
}

import { OrderTemplate } from '../../domain/entities/order-template.entity';
import { OrderTemplateEntity } from './order-template.entity';
import { OrderSectionTemplateMapper } from './order-section-template.mapper';

export class OrderTemplateMapper {
  static toDomain(entity: OrderTemplateEntity): OrderTemplate {
    const sections = entity.sections
      ? OrderSectionTemplateMapper.toDomainList(entity.sections)
      : [];

    return OrderTemplate.restore({
      id: entity.id,
      name: entity.name,
      code: entity.code,
      description: entity.description,
      isActive: entity.isActive,
      sections,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPersistence(domain: OrderTemplate): OrderTemplateEntity {
    const entity = new OrderTemplateEntity();
    
    if (domain.getId()) {
      entity.id = domain.getId()!;
    }
    
    entity.name = domain.getName();
    entity.code = domain.getCode();
    entity.description = domain.getDescription();
    entity.isActive = domain.getIsActive();
    entity.createdAt = domain.getCreatedAt();
    entity.updatedAt = domain.getUpdatedAt();
    
    // Sections are handled separately
    entity.sections = domain.getSections().map(s => 
      OrderSectionTemplateMapper.toPersistence(s)
    );
    
    return entity;
  }

  static toDomainList(entities: OrderTemplateEntity[]): OrderTemplate[] {
    return entities.map(entity => this.toDomain(entity));
  }
}

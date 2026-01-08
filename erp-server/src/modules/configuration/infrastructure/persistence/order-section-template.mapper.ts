import { OrderSectionTemplate } from '../../domain/entities/order-section-template.entity';
import { OrderSectionTemplateEntity } from './order-section-template.entity';

export class OrderSectionTemplateMapper {
  static toDomain(entity: OrderSectionTemplateEntity): OrderSectionTemplate {
    return OrderSectionTemplate.restore({
      id: entity.id,
      templateId: entity.templateId,
      sectionNumber: entity.sectionNumber,
      defaultName: entity.defaultName,
      description: entity.description,
      isRequired: entity.isRequired,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPersistence(domain: OrderSectionTemplate): OrderSectionTemplateEntity {
    const entity = new OrderSectionTemplateEntity();
    
    if (domain.getId()) {
      entity.id = domain.getId()!;
    }
    
    entity.templateId = domain.getTemplateId();
    entity.sectionNumber = domain.getSectionNumber();
    entity.defaultName = domain.getDefaultName();
    entity.description = domain.getDescription();
    entity.isRequired = domain.getIsRequired();
    entity.createdAt = domain.getCreatedAt();
    entity.updatedAt = domain.getUpdatedAt();
    
    return entity;
  }

  static toDomainList(entities: OrderSectionTemplateEntity[]): OrderSectionTemplate[] {
    return entities.map(entity => this.toDomain(entity));
  }
}

import { OrderSectionTemplate } from '../entities/order-section-template.entity';

/**
 * Интерфейс репозитория для OrderSectionTemplate
 * Используется abstract class вместо interface из-за emitDecoratorMetadata
 */
export abstract class IOrderSectionTemplateRepository {
  abstract save(section: OrderSectionTemplate): Promise<OrderSectionTemplate>;
  abstract findById(id: number): Promise<OrderSectionTemplate | null>;
  abstract findByTemplateId(templateId: number): Promise<OrderSectionTemplate[]>;
  abstract delete(id: number): Promise<void>;
}

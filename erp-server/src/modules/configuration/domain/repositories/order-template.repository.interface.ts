import { OrderTemplate } from '../entities/order-template.entity';

/**
 * Интерфейс репозитория для OrderTemplate
 * Используется abstract class вместо interface из-за emitDecoratorMetadata
 */
export abstract class IOrderTemplateRepository {
  abstract save(template: OrderTemplate): Promise<OrderTemplate>;
  abstract findById(id: number): Promise<OrderTemplate | null>;
  abstract findByCode(code: string): Promise<OrderTemplate | null>;
  abstract existsByCode(code: string): Promise<boolean>;
  abstract findAllActive(): Promise<OrderTemplate[]>;
  abstract delete(id: number): Promise<void>;
}

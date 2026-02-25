import { ProductComponentSchema } from '../entities/product-component-schema.entity';

export const PRODUCT_COMPONENT_SCHEMA_REPOSITORY = 'PRODUCT_COMPONENT_SCHEMA_REPOSITORY';

/**
 * Интерфейс репозитория схем компонентов продукта
 */
export interface IProductComponentSchemaRepository {
    /**
     * Сохраняет схему компонента
     */
    save(schema: ProductComponentSchema): Promise<ProductComponentSchema>;

    /**
     * Находит все схемы компонентов для конкретного продукта
     */
    findByProductId(productId: number): Promise<ProductComponentSchema[]>;

    /**
     * Находит схему по ID
     */
    findById(id: number): Promise<ProductComponentSchema | null>;

    /**
     * Удаляет схему по ID
     */
    delete(id: number): Promise<void>;
}

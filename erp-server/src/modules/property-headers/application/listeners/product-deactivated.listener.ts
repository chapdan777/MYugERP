import { Injectable, Inject, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ProductDeactivatedEvent } from '../../../products/domain/events/product-deactivated.event';
import { ProductClonedEvent } from '../../../products/domain/events/product-cloned.event';
import { PROPERTY_HEADER_PRODUCT_REPOSITORY } from '../../domain/repositories';
import type { IPropertyHeaderProductRepository } from '../../domain/repositories/property-header-product.repository.interface';
import { PropertyHeaderProduct } from '../../domain/entities/property-header-product.entity';

/**
 * Слушатель событий для управления связями продуктов с шапками
 */
@Injectable()
export class PropertyHeaderProductListener {
    private readonly logger = new Logger(PropertyHeaderProductListener.name);

    constructor(
        @Inject(PROPERTY_HEADER_PRODUCT_REPOSITORY)
        private readonly propertyHeaderProductRepository: IPropertyHeaderProductRepository,
    ) { }

    /**
     * Обработка деактивации продукта: удаляем все связи с шапками свойств
     */
    @OnEvent('product.deactivated')
    async handleProductDeactivatedEvent(event: ProductDeactivatedEvent) {
        this.logger.log(`Received product.deactivated event for productId: ${event.productId}. Cleaning up header associations...`);
        try {
            // В нашем случае, так как это связь Many-to-Many, мы просто удаляем по productId
            await this.propertyHeaderProductRepository.deleteByProductId(event.productId);

            this.logger.log(`Successfully cleaned up header associations for productId: ${event.productId}`);
        } catch (error) {
            this.logger.error(`Failed to cleanup header associations for productId: ${event.productId}`, error);
        }
    }

    /**
     * Обработка клонирования продукта: копируем все связи с шапками свойств
     */
    @OnEvent('product.cloned')
    async handleProductClonedEvent(event: ProductClonedEvent) {
        this.logger.log(`Received product.cloned event. Copying header associations from ${event.originalProductId} to ${event.newProductId}...`);
        try {
            const associations = await this.propertyHeaderProductRepository.findByProductId(event.originalProductId);

            for (const assoc of associations) {
                const newAssoc = PropertyHeaderProduct.create({
                    headerId: assoc.getHeaderId(),
                    productId: event.newProductId,
                });
                await this.propertyHeaderProductRepository.save(newAssoc);
            }

            this.logger.log(`Successfully copied ${associations.length} header associations for new product ${event.newProductId}`);
        } catch (error) {
            this.logger.error(`Failed to copy header associations for product ${event.newProductId}`, error);
        }
    }
}

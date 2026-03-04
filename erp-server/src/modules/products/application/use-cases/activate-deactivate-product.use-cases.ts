import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { ProductDeactivatedEvent } from '../../domain/events/product-deactivated.event';

/**
 * Use Case: Деактивация продукта
 */
@Injectable()
export class DeactivateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async execute(id: number): Promise<Product> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException(`Продукт с ID ${id} не найден`);
    }

    product.deactivate();
    const savedProduct = await this.productRepository.save(product);

    // Опубликовать событие для очистки связей в других модулях
    this.eventEmitter.emit('product.deactivated', new ProductDeactivatedEvent(id));

    return savedProduct;
  }
}

/**
 * Use Case: Активация продукта
 */
@Injectable()
export class ActivateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) { }

  async execute(id: number): Promise<Product> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException(`Продукт с ID ${id} не найден`);
    }

    product.activate();
    return this.productRepository.save(product);
  }
}

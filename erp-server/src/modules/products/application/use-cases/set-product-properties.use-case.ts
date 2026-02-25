import { Injectable, Inject } from '@nestjs/common';
import { IProductPropertyRepository } from '../../domain/repositories/product-property.repository.interface';
import { ProductProperty } from '../../domain/entities/product-property.entity';
import { PRODUCT_PROPERTY_REPOSITORY } from '../../domain/repositories/injection-tokens';

export interface SetProductPropertiesInput {
  productId: number;
  properties: Array<{
    propertyId: number;
    isRequired?: boolean;
    displayOrder?: number;
    defaultValue?: string | null;
    isActive?: boolean;
  }>;
}

/**
 * Use Case: Установка свойств для продукта
 * Заменяет все существующие свойства продукта на новые
 */
@Injectable()
export class SetProductPropertiesUseCase {
  constructor(
    @Inject(PRODUCT_PROPERTY_REPOSITORY)
    private readonly productPropertyRepository: IProductPropertyRepository,
  ) { }

  async execute(input: SetProductPropertiesInput): Promise<void> {
    const { productId, properties } = input;

    // Удаляем все существующие свойства продукта
    await this.productPropertyRepository.deleteByProductId(productId);

    // Добавляем новые свойства
    for (let i = 0; i < properties.length; i++) {
      const prop = properties[i];
      const productProperty = ProductProperty.create({
        productId,
        propertyId: prop.propertyId,
        isRequired: prop.isRequired ?? false,
        displayOrder: prop.displayOrder ?? i,
        defaultValue: prop.defaultValue ?? null,
        isActive: prop.isActive ?? true,
      });
      await this.productPropertyRepository.save(productProperty);
    }
  }
}

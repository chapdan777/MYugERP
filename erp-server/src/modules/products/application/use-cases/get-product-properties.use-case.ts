import { Injectable, Inject } from '@nestjs/common';
import { IProductPropertyRepository } from '../../domain/repositories/product-property.repository.interface';
import { PRODUCT_PROPERTY_REPOSITORY } from '../../domain/repositories/injection-tokens';

export interface GetProductPropertiesOutput {
  properties: Array<{
    id: number;
    propertyId: number;
    isRequired: boolean;
    displayOrder: number;
    createdAt: Date;
  }>;
}

/**
 * Use Case: Получение свойств продукта
 */
@Injectable()
export class GetProductPropertiesUseCase {
  constructor(
    @Inject(PRODUCT_PROPERTY_REPOSITORY)
    private readonly productPropertyRepository: IProductPropertyRepository,
  ) {}

  async execute(productId: number): Promise<GetProductPropertiesOutput> {
    const productProperties = await this.productPropertyRepository.findByProductId(productId);
    
    return {
      properties: productProperties.map(pp => ({
        id: pp.getId()!,
        propertyId: pp.getPropertyId(),
        isRequired: pp.getIsRequired(),
        displayOrder: pp.getDisplayOrder(),
        createdAt: pp.getCreatedAt(),
      })),
    };
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { ProductComponentSchema } from '../../domain/entities/product-component-schema.entity';
import type { IProductComponentSchemaRepository } from '../../domain/repositories/product-component-schema.repository.interface';
import { PRODUCT_COMPONENT_SCHEMA_REPOSITORY } from '../../domain/repositories/product-component-schema.repository.interface';

@Injectable()
export class GetProductComponentSchemasUseCase {
    constructor(
        @Inject(PRODUCT_COMPONENT_SCHEMA_REPOSITORY)
        private readonly repository: IProductComponentSchemaRepository,
    ) { }

    async execute(productId: number): Promise<ProductComponentSchema[]> {
        return await this.repository.findByProductId(productId);
    }
}

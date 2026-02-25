import { Injectable, Inject } from '@nestjs/common';
import { ProductComponentSchema } from '../../domain/entities/product-component-schema.entity';
import type { IProductComponentSchemaRepository } from '../../domain/repositories/product-component-schema.repository.interface';
import { PRODUCT_COMPONENT_SCHEMA_REPOSITORY } from '../../domain/repositories/product-component-schema.repository.interface';
import { CreateProductComponentSchemaDto } from '../dto/create-product-component-schema.dto';

@Injectable()
export class CreateProductComponentSchemaUseCase {
    constructor(
        @Inject(PRODUCT_COMPONENT_SCHEMA_REPOSITORY)
        private readonly repository: IProductComponentSchemaRepository,
    ) { }

    async execute(dto: CreateProductComponentSchemaDto): Promise<ProductComponentSchema> {
        const schema = ProductComponentSchema.create({
            productId: dto.productId,
            name: dto.name,
            lengthFormula: dto.lengthFormula,
            widthFormula: dto.widthFormula,
            quantityFormula: dto.quantityFormula,
        });

        return await this.repository.save(schema);
    }
}

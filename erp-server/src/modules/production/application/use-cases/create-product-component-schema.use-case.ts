import { Injectable, Inject } from '@nestjs/common';
import { ProductComponentSchema } from '../../domain/entities/product-component-schema.entity';
import type { IProductComponentSchemaRepository } from '../../domain/repositories/product-component-schema.repository.interface';
import { PRODUCT_COMPONENT_SCHEMA_REPOSITORY } from '../../domain/repositories/product-component-schema.repository.interface';
import { CreateProductComponentSchemaDto } from '../dto/create-product-component-schema.dto';

/**
 * Сценарий создания схемы компонента продукта
 * @description Поддерживает вложенные номенклатуры (рекурсивный BOM)
 */
@Injectable()
export class CreateProductComponentSchemaUseCase {
    constructor(
        @Inject(PRODUCT_COMPONENT_SCHEMA_REPOSITORY)
        private readonly repository: IProductComponentSchemaRepository,
    ) { }

    /** Выполняет создание новой схемы компонента */
    async execute(dto: CreateProductComponentSchemaDto): Promise<ProductComponentSchema> {
        const schema = ProductComponentSchema.create({
            productId: dto.productId,
            name: dto.name,
            lengthFormula: dto.lengthFormula,
            widthFormula: dto.widthFormula,
            quantityFormula: dto.quantityFormula,
            childProductId: dto.childProductId ?? null,
            depthFormula: dto.depthFormula ?? null,
            extraVariables: dto.extraVariables ?? null,
            conditionFormula: dto.conditionFormula ?? null,
            sortOrder: dto.sortOrder ?? 0,
        });

        return await this.repository.save(schema);
    }
}

import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ProductComponentSchema } from '../../domain/entities/product-component-schema.entity';
import type { IProductComponentSchemaRepository } from '../../domain/repositories/product-component-schema.repository.interface';
import { PRODUCT_COMPONENT_SCHEMA_REPOSITORY } from '../../domain/repositories/product-component-schema.repository.interface';
import { UpdateProductComponentSchemaDto } from '../dto/update-product-component-schema.dto';

/**
 * Сценарий обновления существующей схемы компонента продукта
 */
@Injectable()
export class UpdateProductComponentSchemaUseCase {
    constructor(
        @Inject(PRODUCT_COMPONENT_SCHEMA_REPOSITORY)
        private readonly repository: IProductComponentSchemaRepository,
    ) { }

    /** Выполняет обновление схемы */
    async execute(id: number, dto: UpdateProductComponentSchemaDto): Promise<ProductComponentSchema> {
        const schema = await this.repository.findById(id);

        if (!schema) {
            throw new NotFoundException(`Схема компонента с ID ${id} не найдена`);
        }

        schema.update({
            name: dto.name,
            lengthFormula: dto.lengthFormula,
            widthFormula: dto.widthFormula,
            quantityFormula: dto.quantityFormula,
            childProductId: dto.childProductId,
            depthFormula: dto.depthFormula,
            extraVariables: dto.extraVariables,
            conditionFormula: dto.conditionFormula,
            sortOrder: dto.sortOrder,
        });

        return await this.repository.save(schema);
    }
}

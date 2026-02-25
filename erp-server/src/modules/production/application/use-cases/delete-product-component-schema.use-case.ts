import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IProductComponentSchemaRepository } from '../../domain/repositories/product-component-schema.repository.interface';
import { PRODUCT_COMPONENT_SCHEMA_REPOSITORY } from '../../domain/repositories/product-component-schema.repository.interface';

@Injectable()
export class DeleteProductComponentSchemaUseCase {
    constructor(
        @Inject(PRODUCT_COMPONENT_SCHEMA_REPOSITORY)
        private readonly repository: IProductComponentSchemaRepository,
    ) { }

    async execute(id: number): Promise<void> {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Схема компонента с ID ${id} не найдена`);
        }
        await this.repository.delete(id);
    }
}

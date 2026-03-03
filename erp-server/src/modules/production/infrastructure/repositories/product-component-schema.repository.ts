import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IProductComponentSchemaRepository } from '../../domain/repositories/product-component-schema.repository.interface';
import { ProductComponentSchema } from '../../domain/entities/product-component-schema.entity';
import { ProductComponentSchemaEntity } from '../persistence/entities/product-component-schema.entity';

@Injectable()
export class ProductComponentSchemaRepository implements IProductComponentSchemaRepository {
    constructor(
        @InjectRepository(ProductComponentSchemaEntity)
        private readonly repository: Repository<ProductComponentSchemaEntity>,
    ) { }

    async save(schema: ProductComponentSchema): Promise<ProductComponentSchema> {
        const persistenceEntity = this.toPersistence(schema);
        const savedEntity = await this.repository.save(persistenceEntity);
        return this.toDomain(savedEntity);
    }

    async findByProductId(productId: number): Promise<ProductComponentSchema[]> {
        const entities = await this.repository.find({
            where: { productId },
            order: { sortOrder: 'ASC' },
        });
        return entities.map(e => this.toDomain(e));
    }

    async findById(id: number): Promise<ProductComponentSchema | null> {
        const entity = await this.repository.findOne({ where: { id } });
        return entity ? this.toDomain(entity) : null;
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    /** Преобразование доменной сущности в persistence */
    private toPersistence(domain: ProductComponentSchema): ProductComponentSchemaEntity {
        const entity = new ProductComponentSchemaEntity();
        const id = domain.getId();
        if (id) {
            entity.id = id;
        }
        entity.productId = domain.getProductId();
        entity.childProductId = domain.getChildProductId();
        entity.name = domain.getName();
        entity.lengthFormula = domain.getLengthFormula();
        entity.widthFormula = domain.getWidthFormula();
        entity.quantityFormula = domain.getQuantityFormula();
        entity.depthFormula = domain.getDepthFormula();
        entity.extraVariables = domain.getExtraVariables();
        entity.conditionFormula = domain.getConditionFormula();
        entity.sortOrder = domain.getSortOrder();
        return entity;
    }

    /** Преобразование persistence в доменную сущность */
    private toDomain(entity: ProductComponentSchemaEntity): ProductComponentSchema {
        return ProductComponentSchema.restore({
            id: entity.id,
            productId: entity.productId,
            childProductId: entity.childProductId,
            name: entity.name,
            lengthFormula: entity.lengthFormula,
            widthFormula: entity.widthFormula,
            quantityFormula: entity.quantityFormula,
            depthFormula: entity.depthFormula ?? null,
            extraVariables: entity.extraVariables ?? null,
            conditionFormula: entity.conditionFormula ?? null,
            sortOrder: entity.sortOrder ?? 0,
        });
    }
}

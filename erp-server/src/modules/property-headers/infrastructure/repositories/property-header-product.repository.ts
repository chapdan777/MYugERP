import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPropertyHeaderProductRepository } from '../../domain/repositories/property-header-product.repository.interface';
import { PropertyHeaderProduct } from '../../domain/entities/property-header-product.entity';
import { PropertyHeaderProductEntity } from '../persistence/property-header-product.entity';
import { PropertyHeaderProductMapper } from '../mappers/property-header-product.mapper';

@Injectable()
export class PropertyHeaderProductRepository implements IPropertyHeaderProductRepository {
    constructor(
        @InjectRepository(PropertyHeaderProductEntity)
        private readonly repository: Repository<PropertyHeaderProductEntity>,
    ) { }

    async save(item: PropertyHeaderProduct): Promise<PropertyHeaderProduct> {
        const entity = PropertyHeaderProductMapper.toPersistence(item);
        const savedEntity = await this.repository.save(entity);
        return PropertyHeaderProductMapper.toDomain(savedEntity);
    }

    async deleteByHeaderIdAndProductId(headerId: number, productId: number): Promise<void> {
        await this.repository.delete({ headerId, productId });
    }

    async findByHeaderId(headerId: number): Promise<PropertyHeaderProduct[]> {
        const entities = await this.repository.find({ where: { headerId } });
        return entities.map(PropertyHeaderProductMapper.toDomain);
    }

    async findByHeaderIdAndProductId(headerId: number, productId: number): Promise<PropertyHeaderProduct | null> {
        const entity = await this.repository.findOne({ where: { headerId, productId } });
        return entity ? PropertyHeaderProductMapper.toDomain(entity) : null;
    }

    async exists(headerId: number, productId: number): Promise<boolean> {
        const count = await this.repository.count({ where: { headerId, productId } });
        return count > 0;
    }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IProductPropertyRepository } from '../../domain/repositories/product-property.repository.interface';
import { ProductProperty } from '../../domain/entities/product-property.entity';
import { ProductPropertyEntity } from './product-property.entity';
import { ProductPropertyMapper } from './product-property.mapper';

/**
 * TypeORM реализация репозитория ProductProperty
 */
@Injectable()
export class ProductPropertyRepository implements IProductPropertyRepository {
  constructor(
    @InjectRepository(ProductPropertyEntity)
    private readonly repository: Repository<ProductPropertyEntity>,
  ) {}

  async save(productProperty: ProductProperty): Promise<ProductProperty> {
    const entity = ProductPropertyMapper.toPersistence(productProperty);
    const saved = await this.repository.save(entity);
    return ProductPropertyMapper.toDomain(saved);
  }

  async findById(id: number): Promise<ProductProperty | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? ProductPropertyMapper.toDomain(entity) : null;
  }

  async findByProductId(productId: number): Promise<ProductProperty[]> {
    const entities = await this.repository.find({ 
      where: { productId },
      order: { displayOrder: 'ASC' },
    });
    return ProductPropertyMapper.toDomainList(entities);
  }

  async findByPropertyId(propertyId: number): Promise<ProductProperty[]> {
    const entities = await this.repository.find({ where: { propertyId } });
    return ProductPropertyMapper.toDomainList(entities);
  }

  async findByProductAndProperty(productId: number, propertyId: number): Promise<ProductProperty | null> {
    const entity = await this.repository.findOne({ where: { productId, propertyId } });
    return entity ? ProductPropertyMapper.toDomain(entity) : null;
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByProductId(productId: number): Promise<void> {
    await this.repository.delete({ productId });
  }
}

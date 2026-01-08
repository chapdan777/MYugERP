import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { ProductEntity } from './product.entity';
import { ProductMapper } from './product.mapper';
import { ProductCategory } from '../../domain/enums/product-category.enum';

/**
 * TypeORM реализация репозитория Product
 */
@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) {}

  async save(product: Product): Promise<Product> {
    const entity = ProductMapper.toPersistence(product);
    const saved = await this.repository.save(entity);
    return ProductMapper.toDomain(saved);
  }

  async findById(id: number): Promise<Product | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? ProductMapper.toDomain(entity) : null;
  }

  async findByCode(code: string): Promise<Product | null> {
    const entity = await this.repository.findOne({ where: { code } });
    return entity ? ProductMapper.toDomain(entity) : null;
  }

  async findByCategory(category: ProductCategory): Promise<Product[]> {
    const entities = await this.repository.find({ where: { category } });
    return ProductMapper.toDomainList(entities);
  }

  async findAllActive(): Promise<Product[]> {
    const entities = await this.repository.find({ where: { isActive: true } });
    return ProductMapper.toDomainList(entities);
  }

  async findAll(): Promise<Product[]> {
    const entities = await this.repository.find();
    return ProductMapper.toDomainList(entities);
  }

  async existsByCode(code: string): Promise<boolean> {
    const count = await this.repository.count({ where: { code } });
    return count > 0;
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}

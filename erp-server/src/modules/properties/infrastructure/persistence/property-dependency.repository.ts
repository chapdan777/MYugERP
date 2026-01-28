import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPropertyDependencyRepository } from '../../domain/repositories/property-dependency.repository.interface';
import { PropertyDependency } from '../../domain/entities/property-dependency.entity';
import { PropertyDependencyEntity } from './property-dependency.entity';
import { PropertyDependencyMapper } from './property-dependency.mapper';

/**
 * TypeORM реализация репозитория PropertyDependency
 */
@Injectable()
export class PropertyDependencyRepository implements IPropertyDependencyRepository {
  constructor(
    @InjectRepository(PropertyDependencyEntity)
    private readonly repository: Repository<PropertyDependencyEntity>,
  ) { }

  async save(dependency: PropertyDependency): Promise<PropertyDependency> {
    const entity = PropertyDependencyMapper.toPersistence(dependency);
    const saved = await this.repository.save(entity);
    return PropertyDependencyMapper.toDomain(saved);
  }

  async findById(id: number): Promise<PropertyDependency | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? PropertyDependencyMapper.toDomain(entity) : null;
  }

  async findBySourcePropertyId(sourcePropertyId: number): Promise<PropertyDependency[]> {
    const entities = await this.repository.find({
      where: { sourcePropertyId },
    });
    return PropertyDependencyMapper.toDomainList(entities);
  }

  async findByTargetPropertyId(targetPropertyId: number): Promise<PropertyDependency[]> {
    const entities = await this.repository.find({
      where: { targetPropertyId },
    });
    return PropertyDependencyMapper.toDomainList(entities);
  }

  async findAllActive(): Promise<PropertyDependency[]> {
    const entities = await this.repository.find({ where: { isActive: true } });
    return PropertyDependencyMapper.toDomainList(entities);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}

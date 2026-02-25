import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { IPropertyRepository } from '../../domain/repositories/property.repository.interface';
import { Property } from '../../domain/entities/property.entity';
import { PropertyEntity } from './property.entity';
import { PropertyMapper } from './property.mapper';

/**
 * TypeORM реализация репозитория Property
 */
@Injectable()
export class PropertyRepository implements IPropertyRepository {
  constructor(
    @InjectRepository(PropertyEntity)
    private readonly repository: Repository<PropertyEntity>,
  ) { }

  async save(property: Property): Promise<Property> {
    const entity = PropertyMapper.toPersistence(property);
    const saved = await this.repository.save(entity);
    return PropertyMapper.toDomain(saved);
  }

  async findById(id: number): Promise<Property | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['values'],
      order: {
        values: {
          displayOrder: 'ASC',
        },
      },
    });
    return entity ? PropertyMapper.toDomain(entity) : null;
  }

  async findByCode(code: string): Promise<Property | null> {
    const entity = await this.repository.findOne({
      where: { code },
      relations: ['values'],
      order: {
        values: {
          displayOrder: 'ASC',
        },
      },
    });
    return entity ? PropertyMapper.toDomain(entity) : null;
  }

  async findByIds(ids: number[]): Promise<Property[]> {
    if (ids.length === 0) return [];
    const entities = await this.repository.find({
      where: { id: In(ids) },
      relations: ['values'],
      order: {
        values: {
          displayOrder: 'ASC',
        },
      },
    });
    return PropertyMapper.toDomainList(entities);
  }

  async findAllActive(): Promise<Property[]> {
    const entities = await this.repository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
      relations: ['values'],
    });
    return PropertyMapper.toDomainList(entities);
  }

  async findAll(): Promise<Property[]> {
    const entities = await this.repository.find({
      order: { displayOrder: 'ASC' },
      relations: ['values'],
    });
    return PropertyMapper.toDomainList(entities);
  }

  async existsByCode(code: string): Promise<boolean> {
    const count = await this.repository.count({ where: { code } });
    return count > 0;
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}

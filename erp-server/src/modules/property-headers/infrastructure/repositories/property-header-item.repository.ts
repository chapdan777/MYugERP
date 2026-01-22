import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPropertyHeaderItemRepository } from '../../domain/repositories/property-header-item.repository.interface';
import { PropertyHeaderItem } from '../../domain/entities/property-header-item.entity';
import { PropertyHeaderItemEntity } from '../persistence/property-header-item.entity';
import { PropertyHeaderItemMapper } from '../mappers/property-header-item.mapper';

/**
 * Реализация репозитория для PropertyHeaderItem
 */
@Injectable()
export class PropertyHeaderItemRepository implements IPropertyHeaderItemRepository {
  constructor(
    @InjectRepository(PropertyHeaderItemEntity)
    private readonly propertyHeaderItemRepository: Repository<PropertyHeaderItemEntity>,
  ) {}

  async save(item: PropertyHeaderItem): Promise<PropertyHeaderItem> {
    const entity = PropertyHeaderItemMapper.toPersistence(item);
    const savedEntity = await this.propertyHeaderItemRepository.save(entity);
    return PropertyHeaderItemMapper.toDomain(savedEntity);
  }

  async saveMany(items: PropertyHeaderItem[]): Promise<PropertyHeaderItem[]> {
    const entities = items.map(item => PropertyHeaderItemMapper.toPersistence(item));
    const savedEntities = await this.propertyHeaderItemRepository.save(entities);
    return savedEntities.map(entity => PropertyHeaderItemMapper.toDomain(entity));
  }

  async findByHeaderId(headerId: number): Promise<PropertyHeaderItem[]> {
    const entities = await this.propertyHeaderItemRepository.find({ 
      where: { headerId },
      order: { sortOrder: 'ASC', propertyId: 'ASC' }
    });
    return entities.map(entity => PropertyHeaderItemMapper.toDomain(entity));
  }

  async findByHeaderIdAndPropertyId(headerId: number, propertyId: number): Promise<PropertyHeaderItem | null> {
    const entity = await this.propertyHeaderItemRepository.findOne({ 
      where: { headerId, propertyId } 
    });
    return entity ? PropertyHeaderItemMapper.toDomain(entity) : null;
  }

  async deleteByHeaderId(headerId: number): Promise<void> {
    await this.propertyHeaderItemRepository.delete({ headerId });
  }

  async deleteByHeaderIdAndPropertyId(headerId: number, propertyId: number): Promise<void> {
    await this.propertyHeaderItemRepository.delete({ headerId, propertyId });
  }
}
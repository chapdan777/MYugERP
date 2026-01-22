import { Injectable } from '@nestjs/common';
import { Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IPropertyValueRepository } from '../../domain/repositories/property-value.repository.interface';
import { PropertyValue } from '../../domain/entities/property-value.entity';
import { PropertyValueEntity } from './property-value.entity';
import { PropertyValueMapper } from './property-value.mapper';

@Injectable()
export class PropertyValueRepository implements IPropertyValueRepository {
  constructor(
    @InjectRepository(PropertyValueEntity)
    private readonly repository: Repository<PropertyValueEntity>,
  ) {}

  async findById(id: number): Promise<PropertyValue | null> {
    const entity = await this.repository.findOne({ 
      where: { id, isActive: true },
      relations: ['priceModifier'] 
    });
    return entity ? PropertyValueMapper.toDomain(entity) : null;
  }

  async findByPropertyId(propertyId: number): Promise<PropertyValue[]> {
    const entities = await this.repository.find({ 
      where: { propertyId, isActive: true },
      order: { displayOrder: 'ASC', value: 'ASC' },
      relations: ['priceModifier'] 
    });
    return entities.map(entity => PropertyValueMapper.toDomain(entity));
  }

  async findByPropertyIdAndValue(propertyId: number, value: string): Promise<PropertyValue | null> {
    const entity = await this.repository.findOne({ 
      where: { propertyId, value, isActive: true },
      relations: ['priceModifier'] 
    });
    return entity ? PropertyValueMapper.toDomain(entity) : null;
  }

  async save(entity: PropertyValue): Promise<PropertyValue> {
    const persistenceEntity = PropertyValueMapper.toPersistence(entity);
    const savedEntity = await this.repository.save(persistenceEntity);
    return PropertyValueMapper.toDomain(savedEntity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.update(id, { isActive: false });
  }

  async findAllByPropertyIds(propertyIds: number[]): Promise<PropertyValue[]> {
    const entities = await this.repository.find({ 
      where: { 
        propertyId: In(propertyIds), 
        isActive: true 
      },
      order: { displayOrder: 'ASC', value: 'ASC' },
      relations: ['priceModifier'] 
    });
    return entities.map(entity => PropertyValueMapper.toDomain(entity));
  }
}
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPropertyHeaderRepository } from '../../domain/repositories/property-header.repository.interface';
import { PropertyHeader } from '../../domain/entities/property-header.entity';
import { PropertyHeaderEntity } from '../persistence/property-header.entity';
import { PropertyHeaderMapper } from '../mappers/property-header.mapper';

/**
 * Реализация репозитория для PropertyHeader
 */
@Injectable()
export class PropertyHeaderRepository implements IPropertyHeaderRepository {
  constructor(
    @InjectRepository(PropertyHeaderEntity)
    private readonly propertyHeaderRepository: Repository<PropertyHeaderEntity>,
  ) {}

  async save(header: PropertyHeader): Promise<PropertyHeader> {
    const entity = PropertyHeaderMapper.toPersistence(header);
    const savedEntity = await this.propertyHeaderRepository.save(entity);
    return PropertyHeaderMapper.toDomain(savedEntity);
  }

  async findById(id: number): Promise<PropertyHeader | null> {
    const entity = await this.propertyHeaderRepository.findOne({ where: { id } });
    return entity ? PropertyHeaderMapper.toDomain(entity) : null;
  }

  async findByName(name: string): Promise<PropertyHeader | null> {
    const entity = await this.propertyHeaderRepository.findOne({ where: { name } });
    return entity ? PropertyHeaderMapper.toDomain(entity) : null;
  }

  async findByOrderTypeId(orderTypeId: number): Promise<PropertyHeader[]> {
    const entities = await this.propertyHeaderRepository.find({ 
      where: { orderTypeId, isActive: true } 
    });
    return entities.map(entity => PropertyHeaderMapper.toDomain(entity));
  }

  async findAll(filters?: {
    isActive?: boolean;
    orderTypeId?: number;
  }): Promise<PropertyHeader[]> {
    const where: any = {};
    
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    
    if (filters?.orderTypeId !== undefined) {
      where.orderTypeId = filters.orderTypeId;
    }

    const entities = await this.propertyHeaderRepository.find({ where });
    return entities.map(entity => PropertyHeaderMapper.toDomain(entity));
  }

  async delete(id: number): Promise<void> {
    await this.propertyHeaderRepository.delete(id);
  }

  async existsByName(name: string, excludeId?: number): Promise<boolean> {
    const queryBuilder = this.propertyHeaderRepository.createQueryBuilder('header')
      .where('header.name = :name', { name });
      
    if (excludeId) {
      queryBuilder.andWhere('header.id != :excludeId', { excludeId });
    }
    
    const count = await queryBuilder.getCount();
    return count > 0;
  }
}
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPriceModifierRepository } from '../../domain/repositories/price-modifier.repository.interface';
import { PriceModifier } from '../../domain/entities/price-modifier.entity';
import { PriceModifierEntity } from './price-modifier.entity';
import { PriceModifierMapper } from './price-modifier.mapper';

@Injectable()
export class PriceModifierRepository implements IPriceModifierRepository {
  constructor(
    @InjectRepository(PriceModifierEntity)
    private readonly repository: Repository<PriceModifierEntity>,
  ) {}

  async save(modifier: PriceModifier): Promise<PriceModifier> {
    const entity = PriceModifierMapper.toPersistence(modifier);
    const saved = await this.repository.save(entity);
    return PriceModifierMapper.toDomain(saved);
  }

  async findById(id: number): Promise<PriceModifier | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? PriceModifierMapper.toDomain(entity) : null;
  }

  async findByCode(code: string): Promise<PriceModifier | null> {
    const entity = await this.repository.findOne({ where: { code } });
    return entity ? PriceModifierMapper.toDomain(entity) : null;
  }

  async existsByCode(code: string): Promise<boolean> {
    const count = await this.repository.count({ where: { code } });
    return count > 0;
  }

  async findAllActive(): Promise<PriceModifier[]> {
    const entities = await this.repository.find({
      where: { isActive: true },
      order: { priority: 'ASC' },
    });
    return PriceModifierMapper.toDomainList(entities);
  }

  async findByPropertyId(propertyId: number): Promise<PriceModifier[]> {
    const entities = await this.repository.find({
      where: { propertyId, isActive: true },
      order: { priority: 'ASC' },
    });
    return PriceModifierMapper.toDomainList(entities);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}

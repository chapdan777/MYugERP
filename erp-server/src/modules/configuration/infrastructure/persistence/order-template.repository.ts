import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOrderTemplateRepository } from '../../domain/repositories/order-template.repository.interface';
import { OrderTemplate } from '../../domain/entities/order-template.entity';
import { OrderTemplateEntity } from './order-template.entity';
import { OrderTemplateMapper } from './order-template.mapper';

@Injectable()
export class OrderTemplateRepository implements IOrderTemplateRepository {
  constructor(
    @InjectRepository(OrderTemplateEntity)
    private readonly repository: Repository<OrderTemplateEntity>,
  ) {}

  async save(template: OrderTemplate): Promise<OrderTemplate> {
    const entity = OrderTemplateMapper.toPersistence(template);
    const saved = await this.repository.save(entity);
    return OrderTemplateMapper.toDomain(saved);
  }

  async findById(id: number): Promise<OrderTemplate | null> {
    const entity = await this.repository.findOne({ 
      where: { id },
      relations: ['sections'],
    });
    return entity ? OrderTemplateMapper.toDomain(entity) : null;
  }

  async findByCode(code: string): Promise<OrderTemplate | null> {
    const entity = await this.repository.findOne({ 
      where: { code },
      relations: ['sections'],
    });
    return entity ? OrderTemplateMapper.toDomain(entity) : null;
  }

  async existsByCode(code: string): Promise<boolean> {
    const count = await this.repository.count({ where: { code } });
    return count > 0;
  }

  async findAllActive(): Promise<OrderTemplate[]> {
    const entities = await this.repository.find({
      where: { isActive: true },
      relations: ['sections'],
      order: { name: 'ASC' },
    });
    return OrderTemplateMapper.toDomainList(entities);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOrderSectionTemplateRepository } from '../../domain/repositories/order-section-template.repository.interface';
import { OrderSectionTemplate } from '../../domain/entities/order-section-template.entity';
import { OrderSectionTemplateEntity } from './order-section-template.entity';
import { OrderSectionTemplateMapper } from './order-section-template.mapper';

@Injectable()
export class OrderSectionTemplateRepository implements IOrderSectionTemplateRepository {
  constructor(
    @InjectRepository(OrderSectionTemplateEntity)
    private readonly repository: Repository<OrderSectionTemplateEntity>,
  ) {}

  async save(section: OrderSectionTemplate): Promise<OrderSectionTemplate> {
    const entity = OrderSectionTemplateMapper.toPersistence(section);
    const saved = await this.repository.save(entity);
    return OrderSectionTemplateMapper.toDomain(saved);
  }

  async findById(id: number): Promise<OrderSectionTemplate | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? OrderSectionTemplateMapper.toDomain(entity) : null;
  }

  async findByTemplateId(templateId: number): Promise<OrderSectionTemplate[]> {
    const entities = await this.repository.find({
      where: { templateId },
      order: { sectionNumber: 'ASC' },
    });
    return OrderSectionTemplateMapper.toDomainList(entities);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { Order } from '../../domain/entities/order.entity';
import { OrderEntity } from './order.entity';
import { OrderMapper } from '../mappers/order.mapper';

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  async save(order: Order): Promise<Order> {
    const orderEntity = OrderMapper.toPersistence(order);
    const savedEntity = await this.orderRepository.save(orderEntity);
    return OrderMapper.toDomain(savedEntity);
  }

  async findById(id: number): Promise<Order | null> {
    const orderEntity = await this.orderRepository.findOne({ where: { id }, relations: ['sections', 'sections.items'] });
    return orderEntity ? OrderMapper.toDomain(orderEntity) : null;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const orderEntity = await this.orderRepository.findOne({ where: { orderNumber }, relations: ['sections', 'sections.items'] });
    return orderEntity ? OrderMapper.toDomain(orderEntity) : null;
  }

  async existsByOrderNumber(orderNumber: string): Promise<boolean> {
    const count = await this.orderRepository.count({ where: { orderNumber } });
    return count > 0;
  }

  async findAll(filters?: {
    clientId?: number;
    status?: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<Order[]> {
    const orderEntities = await this.orderRepository.find({ where: filters, relations: ['sections', 'sections.items'] });
    return orderEntities.map(OrderMapper.toDomain);
  }

  async delete(id: number): Promise<void> {
    await this.orderRepository.delete(id);
  }

  async generateOrderNumber(): Promise<string> {
    // This is a simplified version. In a real application, you would have a more robust mechanism.
    const lastOrder = await this.orderRepository.find({ order: { id: 'DESC' }, take: 1 });
    const lastId = lastOrder.length > 0 ? lastOrder[0].id : 0;
    return `ORDER-${lastId + 1}`;
  }
}
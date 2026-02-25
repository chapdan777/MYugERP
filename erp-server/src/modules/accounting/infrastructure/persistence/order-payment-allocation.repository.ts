import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOrderPaymentAllocationRepository } from '../../domain/repositories/order-payment-allocation.repository.interface';
import { OrderPaymentAllocation } from '../../domain/entities/order-payment-allocation.entity';
import { OrderPaymentAllocationEntity } from './entities/order-payment-allocation.entity';
import { OrderPaymentAllocationMapper } from './mappers/order-payment-allocation.mapper';

@Injectable()
export class OrderPaymentAllocationRepository
    implements IOrderPaymentAllocationRepository {
    constructor(
        @InjectRepository(OrderPaymentAllocationEntity)
        private readonly repository: Repository<OrderPaymentAllocationEntity>,
    ) { }

    async findById(id: number): Promise<OrderPaymentAllocation | null> {
        const entity = await this.repository.findOne({ where: { id } });
        return entity ? OrderPaymentAllocationMapper.toDomain(entity) : null;
    }

    async findByOrderId(orderId: number): Promise<OrderPaymentAllocation[]> {
        const entities = await this.repository.find({ where: { orderId } });
        return entities.map(OrderPaymentAllocationMapper.toDomain);
    }

    async findByClientId(clientId: number): Promise<OrderPaymentAllocation[]> {
        const entities = await this.repository.find({ where: { clientId } });
        return entities.map(OrderPaymentAllocationMapper.toDomain);
    }

    async findByPaymentId(paymentId: number): Promise<OrderPaymentAllocation[]> {
        const entities = await this.repository.find({ where: { paymentId } });
        return entities.map(OrderPaymentAllocationMapper.toDomain);
    }

    async findActiveByOrderId(orderId: number): Promise<OrderPaymentAllocation[]> {
        const entities = await this.repository.find({
            where: { orderId, isCancelled: false },
        });
        return entities.map(OrderPaymentAllocationMapper.toDomain);
    }

    async findActiveByClientId(
        clientId: number,
    ): Promise<OrderPaymentAllocation[]> {
        const entities = await this.repository.find({
            where: { clientId, isCancelled: false },
        });
        return entities.map(OrderPaymentAllocationMapper.toDomain);
    }

    async getTotalAllocatedForOrder(orderId: number): Promise<number> {
        const { sum } = await this.repository
            .createQueryBuilder('allocation')
            .select('SUM(allocation.allocatedAmount)', 'sum')
            .where('allocation.orderId = :orderId', { orderId })
            .andWhere('allocation.isCancelled = :isCancelled', { isCancelled: false })
            .getRawOne();
        return sum ? Number(sum) : 0;
    }

    async getTotalAllocatedForClient(clientId: number): Promise<number> {
        const { sum } = await this.repository
            .createQueryBuilder('allocation')
            .select('SUM(allocation.allocatedAmount)', 'sum')
            .where('allocation.clientId = :clientId', { clientId })
            .andWhere('allocation.isCancelled = :isCancelled', { isCancelled: false })
            .getRawOne();
        return sum ? Number(sum) : 0;
    }

    async save(
        allocation: OrderPaymentAllocation,
    ): Promise<OrderPaymentAllocation> {
        const entity = OrderPaymentAllocationMapper.toPersistence(allocation);
        const savedEntity = await this.repository.save(entity);
        return OrderPaymentAllocationMapper.toDomain(savedEntity);
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }
}

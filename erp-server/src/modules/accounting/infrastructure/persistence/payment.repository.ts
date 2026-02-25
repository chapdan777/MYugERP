import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { IPaymentRepository } from '../../domain/repositories/payment.repository.interface';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentEntity } from './entities/payment.entity';
import { PaymentMapper } from './mappers/payment.mapper';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
    constructor(
        @InjectRepository(PaymentEntity)
        private readonly repository: Repository<PaymentEntity>,
    ) { }

    async findById(id: number): Promise<Payment | null> {
        const entity = await this.repository.findOne({ where: { id } });
        return entity ? PaymentMapper.toDomain(entity) : null;
    }

    async findByClientId(clientId: number): Promise<Payment[]> {
        const entities = await this.repository.find({ where: { clientId } });
        return entities.map(PaymentMapper.toDomain);
    }

    async findByClientIdWithPagination(
        clientId: number,
        page: number,
        limit: number,
    ): Promise<{ payments: Payment[]; total: number }> {
        const [entities, total] = await this.repository.findAndCount({
            where: { clientId },
            skip: (page - 1) * limit,
            take: limit,
            order: { paymentDate: 'DESC' },
        });
        return {
            payments: entities.map(PaymentMapper.toDomain),
            total,
        };
    }

    async findByReferenceNumber(
        referenceNumber: string,
    ): Promise<Payment | null> {
        const entity = await this.repository.findOne({ where: { referenceNumber } });
        return entity ? PaymentMapper.toDomain(entity) : null;
    }

    async findByDateRange(startDate: Date, endDate: Date): Promise<Payment[]> {
        const entities = await this.repository.find({
            where: {
                paymentDate: Between(startDate, endDate),
            },
            order: { paymentDate: 'DESC' },
        });
        return entities.map(PaymentMapper.toDomain);
    }

    async findByClientIdAndDateRange(
        clientId: number,
        startDate: Date,
        endDate: Date,
    ): Promise<Payment[]> {
        const entities = await this.repository.find({
            where: {
                clientId,
                paymentDate: Between(startDate, endDate),
            },
            order: { paymentDate: 'DESC' },
        });
        return entities.map(PaymentMapper.toDomain);
    }

    async save(payment: Payment): Promise<Payment> {
        const entity = PaymentMapper.toPersistence(payment);
        const savedEntity = await this.repository.save(entity);
        return PaymentMapper.toDomain(savedEntity);
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }
}

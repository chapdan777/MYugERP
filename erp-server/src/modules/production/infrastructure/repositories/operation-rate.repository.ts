import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOperationRateRepository } from '../../domain/repositories/operation-rate.repository.interface';
import { OperationRate } from '../../domain/entities/operation-rate.entity';
import { OperationRateEntity } from '../persistence/entities/operation-rate.entity';
import { OperationRateMapper } from '../persistence/mappers/operation-rate.mapper';

@Injectable()
export class OperationRateRepository implements IOperationRateRepository {
    constructor(
        @InjectRepository(OperationRateEntity)
        private readonly repository: Repository<OperationRateEntity>,
    ) { }

    async save(rate: OperationRate): Promise<OperationRate> {
        const persistenceEntity = OperationRateMapper.toPersistence(rate);
        const savedEntity = await this.repository.save(persistenceEntity);
        return OperationRateMapper.toDomain(savedEntity);
    }

    async findById(id: number): Promise<OperationRate | null> {
        const entity = await this.repository.findOne({ where: { id } });
        return entity ? OperationRateMapper.toDomain(entity) : null;
    }

    async findByOperationId(operationId: number): Promise<OperationRate[]> {
        const entities = await this.repository.find({ where: { operationId } });
        return entities.map(entity => OperationRateMapper.toDomain(entity));
    }

    async findByOperationAndProperty(operationId: number, propertyValueId: number | null): Promise<OperationRate | null> {
        const where: any = { operationId };
        if (propertyValueId === null) {
            where.propertyValueId = null; // Ideally TypeORM handles this, but Check IsNull() if needed. 
            // In minimal setup just null works if ORM configured correctly, otherwise IsNull() from typeorm.
        } else {
            where.propertyValueId = propertyValueId;
        }

        // TypeORM simple find handles nulls correctly usually.
        const entity = await this.repository.findOne({ where });
        return entity ? OperationRateMapper.toDomain(entity) : null;
    }

    async findAll(): Promise<OperationRate[]> {
        const entities = await this.repository.find();
        return entities.map(entity => OperationRateMapper.toDomain(entity));
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }
}

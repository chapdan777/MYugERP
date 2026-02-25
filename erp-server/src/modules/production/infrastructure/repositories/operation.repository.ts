import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOperationRepository } from '../../domain/repositories/operation.repository.interface';
import { Operation } from '../../domain/entities/operation.entity';
import { OperationEntity } from '../persistence/entities/operation.entity';
import { OperationMapper } from '../persistence/mappers/operation.mapper';

/**
 * Реализация репозитория производственных операций
 */
@Injectable()
export class OperationRepository implements IOperationRepository {
    constructor(
        @InjectRepository(OperationEntity)
        private readonly repository: Repository<OperationEntity>,
    ) { }

    /**
     * Сохранить операцию (создание или обновление)
     */
    async save(operation: Operation): Promise<Operation> {
        const entity = this.repository.create(OperationMapper.toPersistence(operation));
        const saved = await this.repository.save(entity);
        return OperationMapper.toDomain(saved);
    }

    /**
     * Найти операцию по ID
     */
    async findById(id: number): Promise<Operation | null> {
        const entity = await this.repository.findOne({ where: { id } });
        return entity ? OperationMapper.toDomain(entity) : null;
    }

    /**
     * Найти операцию по коду
     */
    async findByCode(code: string): Promise<Operation | null> {
        const entity = await this.repository.findOne({ where: { code } });
        return entity ? OperationMapper.toDomain(entity) : null;
    }

    /**
     * Получить все операции
     */
    async findAll(): Promise<Operation[]> {
        const entities = await this.repository.find({ order: { code: 'ASC' } });
        return entities.map(OperationMapper.toDomain);
    }

    /**
     * Получить только активные операции
     */
    async findAllActive(): Promise<Operation[]> {
        const entities = await this.repository.find({
            where: { isActive: true },
            order: { code: 'ASC' },
        });
        return entities.map(OperationMapper.toDomain);
    }

    /**
     * Удалить операцию по ID
     */
    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IWorkOrderStatusRepository } from '../../domain/repositories/work-order-status.repository.interface';
import { WorkOrderStatusEntity } from '../../domain/entities/work-order-status.entity';
import { WorkOrderStatusOrmEntity } from '../persistence/entities/work-order-status.entity';

/**
 * Реализация репозитория статусов заказ-нарядов
 */
@Injectable()
export class WorkOrderStatusRepository implements IWorkOrderStatusRepository {
    constructor(
        @InjectRepository(WorkOrderStatusOrmEntity)
        private readonly repository: Repository<WorkOrderStatusOrmEntity>,
    ) { }

    async save(status: WorkOrderStatusEntity): Promise<WorkOrderStatusEntity> {
        const entity = this.repository.create({
            id: status.getId(),
            code: status.getCode(),
            name: status.getName(),
            color: status.getColor(),
            sortOrder: status.getSortOrder(),
            isInitial: status.getIsInitial(),
            isFinal: status.getIsFinal(),
            isActive: status.getIsActive(),
        });
        const saved = await this.repository.save(entity);
        return this.toDomain(saved);
    }

    async findById(id: number): Promise<WorkOrderStatusEntity | null> {
        const entity = await this.repository.findOne({ where: { id } });
        return entity ? this.toDomain(entity) : null;
    }

    async findByCode(code: string): Promise<WorkOrderStatusEntity | null> {
        const entity = await this.repository.findOne({ where: { code } });
        return entity ? this.toDomain(entity) : null;
    }

    async findAll(): Promise<WorkOrderStatusEntity[]> {
        const entities = await this.repository.find({ order: { sortOrder: 'ASC' } });
        return entities.map(e => this.toDomain(e));
    }

    async findAllActive(): Promise<WorkOrderStatusEntity[]> {
        const entities = await this.repository.find({
            where: { isActive: true },
            order: { sortOrder: 'ASC' },
        });
        return entities.map(e => this.toDomain(e));
    }

    async findInitial(): Promise<WorkOrderStatusEntity | null> {
        const entity = await this.repository.findOne({
            where: { isInitial: true, isActive: true },
        });
        return entity ? this.toDomain(entity) : null;
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    private toDomain(entity: WorkOrderStatusOrmEntity): WorkOrderStatusEntity {
        return WorkOrderStatusEntity.restore({
            id: entity.id,
            code: entity.code,
            name: entity.name,
            color: entity.color,
            sortOrder: entity.sortOrder,
            isInitial: entity.isInitial,
            isFinal: entity.isFinal,
            isActive: entity.isActive,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        });
    }
}

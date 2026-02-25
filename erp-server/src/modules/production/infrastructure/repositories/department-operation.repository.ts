import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IDepartmentOperationRepository } from '../../domain/repositories/department-operation.repository.interface';
import { DepartmentOperation } from '../../domain/entities/department-operation.entity';
import { DepartmentOperationEntity } from '../persistence/entities/department-operation.entity';

/**
 * Реализация репозитория связей операций с участками
 */
@Injectable()
export class DepartmentOperationRepository implements IDepartmentOperationRepository {
    constructor(
        @InjectRepository(DepartmentOperationEntity)
        private readonly repository: Repository<DepartmentOperationEntity>,
    ) { }

    /**
     * Сохранить связь операции с участком
     */
    async save(departmentOperation: DepartmentOperation): Promise<DepartmentOperation> {
        const entity = this.repository.create({
            id: departmentOperation.getId(),
            departmentId: departmentOperation.getDepartmentId(),
            operationId: departmentOperation.getOperationId(),
            priority: departmentOperation.getPriority(),
            isActive: departmentOperation.getIsActive(),
        });
        const saved = await this.repository.save(entity);
        return this.toDomain(saved);
    }

    /**
     * Найти по ID
     */
    async findById(id: number): Promise<DepartmentOperation | null> {
        const entity = await this.repository.findOne({ where: { id } });
        return entity ? this.toDomain(entity) : null;
    }

    /**
     * Найти по участку и операции
     */
    async findByDepartmentAndOperation(
        departmentId: number,
        operationId: number,
    ): Promise<DepartmentOperation | null> {
        const entity = await this.repository.findOne({
            where: { departmentId, operationId },
        });
        return entity ? this.toDomain(entity) : null;
    }

    /**
     * Найти все связи участка
     */
    async findByDepartment(departmentId: number): Promise<DepartmentOperation[]> {
        const entities = await this.repository.find({
            where: { departmentId },
            order: { priority: 'DESC' },
        });
        return entities.map(e => this.toDomain(e));
    }

    /**
     * Найти все связи операции
     */
    async findByOperation(operationId: number): Promise<DepartmentOperation[]> {
        const entities = await this.repository.find({
            where: { operationId },
            order: { priority: 'DESC' },
        });
        return entities.map(e => this.toDomain(e));
    }

    /**
     * Получить все связи
     */
    async findAll(): Promise<DepartmentOperation[]> {
        const entities = await this.repository.find({
            order: { departmentId: 'ASC', priority: 'DESC' },
        });
        return entities.map(e => this.toDomain(e));
    }

    /**
     * Удалить связь по ID
     */
    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    /**
     * Преобразовать ORM сущность в доменную
     */
    private toDomain(entity: DepartmentOperationEntity): DepartmentOperation {
        return DepartmentOperation.restore(
            entity.id,
            entity.departmentId,
            entity.operationId,
            entity.priority,
            entity.isActive,
            entity.createdAt,
            entity.updatedAt,
            entity.operation ? { name: entity.operation.name, code: entity.operation.code } : undefined
        );
    }
}

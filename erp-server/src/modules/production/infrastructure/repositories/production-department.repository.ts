import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IProductionDepartmentRepository } from '../../domain/repositories/production-department.repository.interface';
import { ProductionDepartment } from '../../domain/entities/production-department.entity';
import { ProductionDepartmentEntity } from '../persistence/entities/production-department.entity';
import { DepartmentOperationEntity } from '../persistence/entities/department-operation.entity';
import { ProductionDepartmentMapper as Mapper } from '../persistence/mappers/production-department.mapper';

@Injectable()
export class ProductionDepartmentRepository implements IProductionDepartmentRepository {
    constructor(
        @InjectRepository(ProductionDepartmentEntity)
        private readonly repository: Repository<ProductionDepartmentEntity>,
        @InjectRepository(DepartmentOperationEntity)
        private readonly operationRepository: Repository<DepartmentOperationEntity>,
    ) { }

    async save(department: ProductionDepartment): Promise<ProductionDepartment> {
        const persistenceEntity = Mapper.toPersistence(department);
        const savedEntity = await this.repository.save(persistenceEntity);
        return Mapper.toDomain(savedEntity);
    }

    async findById(id: number): Promise<ProductionDepartment | null> {
        const entity = await this.repository.findOne({
            where: { id },
        });
        return entity ? Mapper.toDomain(entity) : null;
    }

    async findByCode(code: string): Promise<ProductionDepartment | null> {
        const entity = await this.repository.findOne({
            where: { code },
        });
        return entity ? Mapper.toDomain(entity) : null;
    }

    async findAll(): Promise<ProductionDepartment[]> {
        const entities = await this.repository.find();
        return entities.map((entity) => Mapper.toDomain(entity));
    }

    async findAllActive(): Promise<ProductionDepartment[]> {
        const entities = await this.repository.find({
            where: { isActive: true },
        });
        return entities.map((entity) => Mapper.toDomain(entity));
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }

    // Operation specific methods if interface requires them.
    // Checking interface capability via findByOperationId in UseCase requirements
    async findByOperationId(operationId: number): Promise<DepartmentForOperationResult[]> {
        const operations = await this.operationRepository.find({
            where: { operationId, isActive: true },
            relations: ['department']
        });

        return operations.map(op => ({
            departmentId: op.departmentId,
            departmentName: op.department.name,
            priority: op.priority
        }));
    }
}

// Helper interface for findByOperationId result, matching what Service expects
export interface DepartmentForOperationResult {
    departmentId: number;
    departmentName: string;
    priority: number;
}

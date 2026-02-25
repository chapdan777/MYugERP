import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IWorkOrderRepository } from '../../domain/repositories/work-order.repository.interface';
import { WorkOrder } from '../../domain/entities/work-order.entity';
import { WorkOrderStatus } from '../../domain/enums/work-order-status.enum';
import { WorkOrderEntity } from '../persistence/entities/work-order.entity';
import { WorkOrderMapper } from '../persistence/mappers/work-order.mapper';

@Injectable()
export class WorkOrderRepository implements IWorkOrderRepository {
    constructor(
        @InjectRepository(WorkOrderEntity)
        private readonly repository: Repository<WorkOrderEntity>,
    ) { }

    async save(workOrder: WorkOrder): Promise<WorkOrder> {
        const persistenceEntity = WorkOrderMapper.toPersistence(workOrder);
        const savedEntity = await this.repository.save(persistenceEntity);
        return WorkOrderMapper.toDomain(savedEntity);
    }

    async findById(id: number): Promise<WorkOrder | null> {
        const entity = await this.repository.findOne({
            where: { id },
            relations: ['items'],
        });
        return entity ? WorkOrderMapper.toDomain(entity) : null;
    }

    async findByOrderId(orderId: number): Promise<WorkOrder[]> {
        const entities = await this.repository.find({
            where: { orderId },
            relations: ['items'],
        });
        return entities.map((entity) => WorkOrderMapper.toDomain(entity));
    }

    async findByWorkOrderNumber(workOrderNumber: string): Promise<WorkOrder | null> {
        const entity = await this.repository.findOne({
            where: { workOrderNumber },
            relations: ['items'],
        });
        return entity ? WorkOrderMapper.toDomain(entity) : null;
    }

    async findByDepartmentId(departmentId: number): Promise<WorkOrder[]> {
        const entities = await this.repository.find({
            where: { departmentId },
            relations: ['items'],
        });
        return entities.map((entity) => WorkOrderMapper.toDomain(entity));
    }

    async findByDepartmentIdAndStatus(
        departmentId: number,
        status: WorkOrderStatus,
    ): Promise<WorkOrder[]> {
        const entities = await this.repository.find({
            where: { departmentId, status },
            relations: ['items'],
        });
        return entities.map((entity) => WorkOrderMapper.toDomain(entity));
    }

    async findByStatus(status: WorkOrderStatus): Promise<WorkOrder[]> {
        const entities = await this.repository.find({
            where: { status },
            relations: ['items'],
        });
        return entities.map((entity) => WorkOrderMapper.toDomain(entity));
    }

    async findAll(): Promise<WorkOrder[]> {
        const entities = await this.repository.find({
            relations: ['items'],
        });
        return entities.map((entity) => WorkOrderMapper.toDomain(entity));
    }

    async generateWorkOrderNumber(): Promise<string> {
        // Простая генерация номера WO-TIMESTAMP-RANDOM
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `WO-${timestamp}-${random}`;
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }
}

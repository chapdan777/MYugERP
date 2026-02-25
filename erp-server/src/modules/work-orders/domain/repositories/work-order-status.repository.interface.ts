import { WorkOrderStatusEntity } from '../entities/work-order-status.entity';

/**
 * Интерфейс репозитория статусов заказ-нарядов
 */
export abstract class IWorkOrderStatusRepository {
    abstract save(status: WorkOrderStatusEntity): Promise<WorkOrderStatusEntity>;
    abstract findById(id: number): Promise<WorkOrderStatusEntity | null>;
    abstract findByCode(code: string): Promise<WorkOrderStatusEntity | null>;
    abstract findAll(): Promise<WorkOrderStatusEntity[]>;
    abstract findAllActive(): Promise<WorkOrderStatusEntity[]>;
    abstract findInitial(): Promise<WorkOrderStatusEntity | null>;
    abstract delete(id: number): Promise<void>;
}

export const WORK_ORDER_STATUS_REPOSITORY = Symbol('WORK_ORDER_STATUS_REPOSITORY');

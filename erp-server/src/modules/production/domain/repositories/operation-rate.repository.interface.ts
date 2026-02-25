import { OperationRate } from '../entities/operation-rate.entity';

export abstract class IOperationRateRepository {
    abstract save(rate: OperationRate): Promise<OperationRate>;
    abstract findById(id: number): Promise<OperationRate | null>;
    abstract findByOperationId(operationId: number): Promise<OperationRate[]>;
    abstract findByOperationAndProperty(operationId: number, propertyValueId: number | null): Promise<OperationRate | null>;
    abstract findAll(): Promise<OperationRate[]>;
    abstract delete(id: number): Promise<void>;
}

export const OPERATION_RATE_REPOSITORY = Symbol('OPERATION_RATE_REPOSITORY');

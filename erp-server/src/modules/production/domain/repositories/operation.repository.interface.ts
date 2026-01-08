import { Operation } from '../entities/operation.entity';

/**
 * Operation Repository Interface
 * Abstract class (not interface) for TypeScript decorator metadata compatibility
 */
export abstract class IOperationRepository {
  abstract save(operation: Operation): Promise<Operation>;
  abstract findById(id: number): Promise<Operation | null>;
  abstract findByCode(code: string): Promise<Operation | null>;
  abstract findAll(): Promise<Operation[]>;
  abstract findAllActive(): Promise<Operation[]>;
  abstract delete(id: number): Promise<void>;
}

export const OPERATION_REPOSITORY = Symbol('OPERATION_REPOSITORY');

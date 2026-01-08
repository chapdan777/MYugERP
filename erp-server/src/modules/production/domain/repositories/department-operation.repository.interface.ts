import { DepartmentOperation } from '../entities/department-operation.entity';

/**
 * Department Operation Repository Interface
 * Abstract class (not interface) for TypeScript decorator metadata compatibility
 */
export abstract class IDepartmentOperationRepository {
  abstract save(departmentOperation: DepartmentOperation): Promise<DepartmentOperation>;
  abstract findById(id: number): Promise<DepartmentOperation | null>;
  abstract findByDepartmentAndOperation(
    departmentId: number,
    operationId: number,
  ): Promise<DepartmentOperation | null>;
  abstract findByDepartment(departmentId: number): Promise<DepartmentOperation[]>;
  abstract findByOperation(operationId: number): Promise<DepartmentOperation[]>;
  abstract findAll(): Promise<DepartmentOperation[]>;
  abstract delete(id: number): Promise<void>;
}

export const DEPARTMENT_OPERATION_REPOSITORY = Symbol('DEPARTMENT_OPERATION_REPOSITORY');

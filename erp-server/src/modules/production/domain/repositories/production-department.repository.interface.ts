import { ProductionDepartment } from '../entities/production-department.entity';

/**
 * Production Department Repository Interface
 * Abstract class (not interface) for TypeScript decorator metadata compatibility
 */
export abstract class IProductionDepartmentRepository {
  abstract save(department: ProductionDepartment): Promise<ProductionDepartment>;
  abstract findById(id: number): Promise<ProductionDepartment | null>;
  abstract findByCode(code: string): Promise<ProductionDepartment | null>;
  abstract findAll(): Promise<ProductionDepartment[]>;
  abstract findAllActive(): Promise<ProductionDepartment[]>;
  abstract delete(id: number): Promise<void>;
}

export const PRODUCTION_DEPARTMENT_REPOSITORY = Symbol('PRODUCTION_DEPARTMENT_REPOSITORY');

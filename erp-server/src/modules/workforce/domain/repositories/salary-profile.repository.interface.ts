import { SalaryProfile } from '../entities/salary-profile.entity';

/**
 * Salary Profile Repository Interface
 * 
 * Defines contract for persisting and retrieving salary profiles
 */
export abstract class ISalaryProfileRepository {
  abstract save(profile: SalaryProfile): Promise<SalaryProfile>;
  abstract findById(id: number): Promise<SalaryProfile | null>;
  abstract findByWorkerId(workerId: number): Promise<SalaryProfile[]>;
  abstract findActiveByWorkerId(workerId: number): Promise<SalaryProfile | null>;
  abstract findCurrentlyEffectiveByWorkerId(workerId: number): Promise<SalaryProfile | null>;
  abstract findAll(): Promise<SalaryProfile[]>;
  abstract findAllActive(): Promise<SalaryProfile[]>;
  abstract delete(id: number): Promise<void>;
}

export const SALARY_PROFILE_REPOSITORY = Symbol('SALARY_PROFILE_REPOSITORY');

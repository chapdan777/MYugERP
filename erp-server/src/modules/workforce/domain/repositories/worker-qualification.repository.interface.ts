import { WorkerQualification } from '../entities/worker-qualification.entity';

/**
 * Worker Qualification Repository Interface
 * 
 * Defines contract for persisting and retrieving worker qualifications
 */
export abstract class IWorkerQualificationRepository {
  abstract save(qualification: WorkerQualification): Promise<WorkerQualification>;
  abstract findById(id: number): Promise<WorkerQualification | null>;
  abstract findByWorkerId(workerId: number): Promise<WorkerQualification[]>;
  abstract findActiveByWorkerId(workerId: number): Promise<WorkerQualification[]>;
  abstract findByOperationId(operationId: number): Promise<WorkerQualification[]>;
  abstract findByWorkerIdAndOperationId(
    workerId: number,
    operationId: number,
  ): Promise<WorkerQualification[]>;
  abstract findValidByWorkerIdAndOperationId(
    workerId: number,
    operationId: number,
  ): Promise<WorkerQualification | null>;
  abstract findExpiringSoon(withinDays: number): Promise<WorkerQualification[]>;
  abstract findExpired(): Promise<WorkerQualification[]>;
  abstract findAll(): Promise<WorkerQualification[]>;
  abstract delete(id: number): Promise<void>;
}

export const WORKER_QUALIFICATION_REPOSITORY = Symbol('WORKER_QUALIFICATION_REPOSITORY');

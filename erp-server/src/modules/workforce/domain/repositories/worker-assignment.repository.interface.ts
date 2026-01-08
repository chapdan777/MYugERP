import { WorkerAssignment } from '../entities/worker-assignment.entity';

/**
 * Worker Assignment Repository Interface
 * 
 * Defines contract for persisting and retrieving worker assignments
 */
export abstract class IWorkerAssignmentRepository {
  abstract save(assignment: WorkerAssignment): Promise<WorkerAssignment>;
  abstract findById(id: number): Promise<WorkerAssignment | null>;
  abstract findByWorkOrderId(workOrderId: number): Promise<WorkerAssignment[]>;
  abstract findActiveByWorkOrderId(workOrderId: number): Promise<WorkerAssignment[]>;
  abstract findByWorkerId(workerId: number): Promise<WorkerAssignment[]>;
  abstract findActiveByWorkerId(workerId: number): Promise<WorkerAssignment[]>;
  abstract findByWorkerIdAndWorkOrderId(
    workerId: number,
    workOrderId: number,
  ): Promise<WorkerAssignment[]>;
  abstract findActiveAssignments(): Promise<WorkerAssignment[]>;
  abstract findAll(): Promise<WorkerAssignment[]>;
  abstract delete(id: number): Promise<void>;
}

export const WORKER_ASSIGNMENT_REPOSITORY = Symbol('WORKER_ASSIGNMENT_REPOSITORY');

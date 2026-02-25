import { Injectable } from '@nestjs/common';
import { CreateWorkerAssignmentDto } from '../../presentation/dtos/create-worker-assignment.dto';

@Injectable()
export class WorkerAssignmentsService {
    // In a real implementation, this would use a repository
    private workerAssignments: any[] = [];

    create(createWorkerAssignmentDto: CreateWorkerAssignmentDto) {
        const newAssignment = {
            id: `wa-${Date.now()}`,
            ...createWorkerAssignmentDto,
        };
        this.workerAssignments.push(newAssignment);
        return newAssignment;
    }

    findOne(id: string) {
        return this.workerAssignments.find((a) => a.id === id);
    }
}

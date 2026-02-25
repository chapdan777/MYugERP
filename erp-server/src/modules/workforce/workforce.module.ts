import { Module } from '@nestjs/common';
import { WorkerAssignmentsController } from './presentation/controllers/worker-assignments.controller';
import { WorkerAssignmentsService } from './application/services/worker-assignments.service';

@Module({
  imports: [],
  controllers: [WorkerAssignmentsController],
  providers: [WorkerAssignmentsService],
})
export class WorkforceModule { }
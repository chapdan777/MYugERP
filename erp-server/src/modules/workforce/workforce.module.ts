import { Module } from '@nestjs/common';
import { WorkerAssignmentsController } from './presentation/controllers/worker-assignments.controller';

@Module({
  imports: [],
  controllers: [WorkerAssignmentsController],
  providers: [],
})
export class WorkforceModule {}
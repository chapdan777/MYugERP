import { Controller, Post, Get, Body, Param, UseGuards, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { CreateWorkerAssignmentDto } from '../dtos/create-worker-assignment.dto';
import { WorkerAssignmentsService } from '../../application/services/worker-assignments.service';

@Controller('worker-assignments')
@UseGuards(JwtAuthGuard)
export class WorkerAssignmentsController {
  constructor(private readonly workerAssignmentsService: WorkerAssignmentsService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createWorkerAssignmentDto: CreateWorkerAssignmentDto) {
    return this.workerAssignmentsService.create(createWorkerAssignmentDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const assignment = this.workerAssignmentsService.findOne(id);
    if (!assignment) {
      throw new NotFoundException(`Worker assignment with ID ${id} not found`);
    }
    return assignment;
  }
}
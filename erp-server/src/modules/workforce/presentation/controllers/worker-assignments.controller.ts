import { Controller, Post, Get, Body, Param, UseGuards, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { CreateWorkerAssignmentDto } from '../dtos/create-worker-assignment.dto';

@Controller('worker-assignments')
@UseGuards(JwtAuthGuard)
export class WorkerAssignmentsController {

  private workerAssignments: any[] = [];

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createWorkerAssignmentDto: CreateWorkerAssignmentDto) {
    const newAssignment = {
      id: `wa-${Date.now()}`,
      ...createWorkerAssignmentDto
    };
    this.workerAssignments.push(newAssignment);
    return newAssignment;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const assignment = this.workerAssignments.find(a => a.id === id);
    if (!assignment) {
      throw new NotFoundException(`Worker assignment with ID ${id} not found`);
    }
    return assignment;
  }
}
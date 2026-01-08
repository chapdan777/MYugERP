import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { DepartmentOperation } from '../../domain/entities/department-operation.entity';
import { IDepartmentOperationRepository, DEPARTMENT_OPERATION_REPOSITORY } from '../../domain/repositories/department-operation.repository.interface';
import { IProductionDepartmentRepository, PRODUCTION_DEPARTMENT_REPOSITORY } from '../../domain/repositories/production-department.repository.interface';
import { IOperationRepository, OPERATION_REPOSITORY } from '../../domain/repositories/operation.repository.interface';
import { CreateDepartmentOperationDto } from '../../presentation/dtos/department-operation.dto';

@Injectable()
export class CreateDepartmentOperationUseCase {
  constructor(
    @Inject(DEPARTMENT_OPERATION_REPOSITORY)
    private readonly departmentOperationRepository: IDepartmentOperationRepository,
    @Inject(PRODUCTION_DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: IProductionDepartmentRepository,
    @Inject(OPERATION_REPOSITORY)
    private readonly operationRepository: IOperationRepository,
  ) {}

  async execute(dto: CreateDepartmentOperationDto): Promise<DepartmentOperation> {
    // Verify department exists
    const department = await this.departmentRepository.findById(dto.departmentId);
    if (!department) {
      throw new NotFoundException(`Department with ID ${dto.departmentId} not found`);
    }

    // Verify operation exists
    const operation = await this.operationRepository.findById(dto.operationId);
    if (!operation) {
      throw new NotFoundException(`Operation with ID ${dto.operationId} not found`);
    }

    // Check if this combination already exists
    const existing = await this.departmentOperationRepository.findByDepartmentAndOperation(
      dto.departmentId,
      dto.operationId,
    );
    if (existing) {
      throw new ConflictException(
        `Department ${dto.departmentId} already linked to operation ${dto.operationId}`,
      );
    }

    // Create department-operation link
    const departmentOperation = DepartmentOperation.create({
      departmentId: dto.departmentId,
      operationId: dto.operationId,
      priority: dto.priority,
      isActive: dto.isActive,
    });

    // Save and return
    return await this.departmentOperationRepository.save(departmentOperation);
  }
}

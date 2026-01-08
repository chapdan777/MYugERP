import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DepartmentOperation } from '../../domain/entities/department-operation.entity';
import { IDepartmentOperationRepository, DEPARTMENT_OPERATION_REPOSITORY } from '../../domain/repositories/department-operation.repository.interface';
import { UpdateDepartmentOperationDto } from '../../presentation/dtos/department-operation.dto';

@Injectable()
export class UpdateDepartmentOperationUseCase {
  constructor(
    @Inject(DEPARTMENT_OPERATION_REPOSITORY)
    private readonly departmentOperationRepository: IDepartmentOperationRepository,
  ) {}

  async execute(id: number, dto: UpdateDepartmentOperationDto): Promise<DepartmentOperation> {
    // Find department-operation link
    const departmentOperation = await this.departmentOperationRepository.findById(id);
    if (!departmentOperation) {
      throw new NotFoundException(`Department-Operation link with ID ${id} not found`);
    }

    // Update link
    departmentOperation.updateInfo({
      priority: dto.priority,
      isActive: dto.isActive,
    });

    // Save and return
    return await this.departmentOperationRepository.save(departmentOperation);
  }
}

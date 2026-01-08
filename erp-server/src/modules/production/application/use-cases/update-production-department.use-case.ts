import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ProductionDepartment } from '../../domain/entities/production-department.entity';
import { IProductionDepartmentRepository, PRODUCTION_DEPARTMENT_REPOSITORY } from '../../domain/repositories/production-department.repository.interface';
import { UpdateProductionDepartmentDto } from '../../presentation/dtos/production-department.dto';

@Injectable()
export class UpdateProductionDepartmentUseCase {
  constructor(
    @Inject(PRODUCTION_DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: IProductionDepartmentRepository,
  ) {}

  async execute(id: number, dto: UpdateProductionDepartmentDto): Promise<ProductionDepartment> {
    // Find department
    const department = await this.departmentRepository.findById(id);
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    // Update department
    department.updateInfo({
      name: dto.name,
      description: dto.description,
      groupingStrategy: dto.groupingStrategy,
      groupingPropertyId: dto.groupingPropertyId,
      isActive: dto.isActive,
    });

    // Save and return
    return await this.departmentRepository.save(department);
  }
}

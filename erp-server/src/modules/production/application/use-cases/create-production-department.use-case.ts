import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { ProductionDepartment } from '../../domain/entities/production-department.entity';
import { IProductionDepartmentRepository, PRODUCTION_DEPARTMENT_REPOSITORY } from '../../domain/repositories/production-department.repository.interface';
import { CreateProductionDepartmentDto } from '../../presentation/dtos/production-department.dto';

@Injectable()
export class CreateProductionDepartmentUseCase {
  constructor(
    @Inject(PRODUCTION_DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: IProductionDepartmentRepository,
  ) {}

  async execute(dto: CreateProductionDepartmentDto): Promise<ProductionDepartment> {
    // Check if department with this code already exists
    const existing = await this.departmentRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(`Department with code '${dto.code}' already exists`);
    }

    // Create department
    const department = ProductionDepartment.create({
      code: dto.code,
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

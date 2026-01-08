import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { CreateProductionDepartmentUseCase } from '../../application/use-cases/create-production-department.use-case';
import { UpdateProductionDepartmentUseCase } from '../../application/use-cases/update-production-department.use-case';
import { IProductionDepartmentRepository, PRODUCTION_DEPARTMENT_REPOSITORY } from '../../domain/repositories/production-department.repository.interface';
import { IDepartmentOperationRepository, DEPARTMENT_OPERATION_REPOSITORY } from '../../domain/repositories/department-operation.repository.interface';
import {
  CreateProductionDepartmentDto,
  UpdateProductionDepartmentDto,
  ProductionDepartmentResponseDto,
} from '../dtos/production-department.dto';
import { DepartmentOperationResponseDto } from '../dtos/department-operation.dto';

@Controller('production-departments')
export class ProductionDepartmentController {
  constructor(
    private readonly createDepartmentUseCase: CreateProductionDepartmentUseCase,
    private readonly updateDepartmentUseCase: UpdateProductionDepartmentUseCase,
    @Inject(PRODUCTION_DEPARTMENT_REPOSITORY)
    private readonly departmentRepository: IProductionDepartmentRepository,
    @Inject(DEPARTMENT_OPERATION_REPOSITORY)
    private readonly departmentOperationRepository: IDepartmentOperationRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProductionDepartmentDto): Promise<ProductionDepartmentResponseDto> {
    const department = await this.createDepartmentUseCase.execute(dto);
    return ProductionDepartmentResponseDto.fromEntity(department);
  }

  @Get()
  async findAll(): Promise<ProductionDepartmentResponseDto[]> {
    const departments = await this.departmentRepository.findAll();
    return departments.map(dept => ProductionDepartmentResponseDto.fromEntity(dept));
  }

  @Get('active')
  async findAllActive(): Promise<ProductionDepartmentResponseDto[]> {
    const departments = await this.departmentRepository.findAllActive();
    return departments.map(dept => ProductionDepartmentResponseDto.fromEntity(dept));
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ProductionDepartmentResponseDto> {
    const department = await this.departmentRepository.findById(id);
    if (!department) {
      throw new Error(`Department with ID ${id} not found`);
    }
    return ProductionDepartmentResponseDto.fromEntity(department);
  }

  @Get(':id/operations')
  async getDepartmentOperations(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DepartmentOperationResponseDto[]> {
    const operations = await this.departmentOperationRepository.findByDepartment(id);
    return operations.map(op => DepartmentOperationResponseDto.fromEntity(op));
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductionDepartmentDto,
  ): Promise<ProductionDepartmentResponseDto> {
    const department = await this.updateDepartmentUseCase.execute(id, dto);
    return ProductionDepartmentResponseDto.fromEntity(department);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.departmentRepository.delete(id);
  }
}

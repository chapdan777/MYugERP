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
import { CreateDepartmentOperationUseCase } from '../../application/use-cases/create-department-operation.use-case';
import { UpdateDepartmentOperationUseCase } from '../../application/use-cases/update-department-operation.use-case';
import { IDepartmentOperationRepository, DEPARTMENT_OPERATION_REPOSITORY } from '../../domain/repositories/department-operation.repository.interface';
import {
  CreateDepartmentOperationDto,
  UpdateDepartmentOperationDto,
  DepartmentOperationResponseDto,
} from '../dtos/department-operation.dto';

@Controller('department-operations')
export class DepartmentOperationController {
  constructor(
    private readonly createDepartmentOperationUseCase: CreateDepartmentOperationUseCase,
    private readonly updateDepartmentOperationUseCase: UpdateDepartmentOperationUseCase,
    @Inject(DEPARTMENT_OPERATION_REPOSITORY)
    private readonly departmentOperationRepository: IDepartmentOperationRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateDepartmentOperationDto): Promise<DepartmentOperationResponseDto> {
    const departmentOperation = await this.createDepartmentOperationUseCase.execute(dto);
    return DepartmentOperationResponseDto.fromEntity(departmentOperation);
  }

  @Get()
  async findAll(): Promise<DepartmentOperationResponseDto[]> {
    const links = await this.departmentOperationRepository.findAll();
    return links.map(link => DepartmentOperationResponseDto.fromEntity(link));
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<DepartmentOperationResponseDto> {
    const link = await this.departmentOperationRepository.findById(id);
    if (!link) {
      throw new Error(`Department-Operation link with ID ${id} not found`);
    }
    return DepartmentOperationResponseDto.fromEntity(link);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentOperationDto,
  ): Promise<DepartmentOperationResponseDto> {
    const link = await this.updateDepartmentOperationUseCase.execute(id, dto);
    return DepartmentOperationResponseDto.fromEntity(link);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.departmentOperationRepository.delete(id);
  }
}

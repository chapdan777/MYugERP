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
import { CreateOperationUseCase } from '../../application/use-cases/create-operation.use-case';
import { UpdateOperationUseCase } from '../../application/use-cases/update-operation.use-case';
import { IOperationRepository, OPERATION_REPOSITORY } from '../../domain/repositories/operation.repository.interface';
import {
  CreateOperationDto,
  UpdateOperationDto,
  OperationResponseDto,
} from '../dtos/operation.dto';

@Controller('operations')
export class OperationController {
  constructor(
    private readonly createOperationUseCase: CreateOperationUseCase,
    private readonly updateOperationUseCase: UpdateOperationUseCase,
    @Inject(OPERATION_REPOSITORY)
    private readonly operationRepository: IOperationRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateOperationDto): Promise<OperationResponseDto> {
    const operation = await this.createOperationUseCase.execute(dto);
    return OperationResponseDto.fromEntity(operation);
  }

  @Get()
  async findAll(): Promise<OperationResponseDto[]> {
    const operations = await this.operationRepository.findAll();
    return operations.map(op => OperationResponseDto.fromEntity(op));
  }

  @Get('active')
  async findAllActive(): Promise<OperationResponseDto[]> {
    const operations = await this.operationRepository.findAllActive();
    return operations.map(op => OperationResponseDto.fromEntity(op));
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<OperationResponseDto> {
    const operation = await this.operationRepository.findById(id);
    if (!operation) {
      throw new Error(`Operation with ID ${id} not found`);
    }
    return OperationResponseDto.fromEntity(operation);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOperationDto,
  ): Promise<OperationResponseDto> {
    const operation = await this.updateOperationUseCase.execute(id, dto);
    return OperationResponseDto.fromEntity(operation);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.operationRepository.delete(id);
  }
}

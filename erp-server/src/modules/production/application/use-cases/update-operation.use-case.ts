import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Operation } from '../../domain/entities/operation.entity';
import { IOperationRepository, OPERATION_REPOSITORY } from '../../domain/repositories/operation.repository.interface';
import { UpdateOperationDto } from '../../presentation/dtos/operation.dto';

@Injectable()
export class UpdateOperationUseCase {
  constructor(
    @Inject(OPERATION_REPOSITORY)
    private readonly operationRepository: IOperationRepository,
  ) {}

  async execute(id: number, dto: UpdateOperationDto): Promise<Operation> {
    // Find operation
    const operation = await this.operationRepository.findById(id);
    if (!operation) {
      throw new NotFoundException(`Operation with ID ${id} not found`);
    }

    // Update operation
    operation.updateInfo({
      name: dto.name,
      description: dto.description,
      isActive: dto.isActive,
    });

    // Save and return
    return await this.operationRepository.save(operation);
  }
}

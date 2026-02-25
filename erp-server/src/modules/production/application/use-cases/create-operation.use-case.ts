import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { Operation } from '../../domain/entities/operation.entity';
import { IOperationRepository, OPERATION_REPOSITORY } from '../../domain/repositories/operation.repository.interface';
import { CreateOperationDto } from '../../presentation/dtos/operation.dto';

@Injectable()
export class CreateOperationUseCase {
  constructor(
    @Inject(OPERATION_REPOSITORY)
    private readonly operationRepository: IOperationRepository,
  ) { }

  async execute(dto: CreateOperationDto): Promise<Operation> {
    // Check if operation with this code already exists
    const existing = await this.operationRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(`Operation with code '${dto.code}' already exists`);
    }

    // Создать операцию с новыми полями
    const operation = Operation.create({
      code: dto.code,
      name: dto.name,
      description: dto.description,
      calculationType: dto.calculationType,
      defaultTimePerUnit: dto.defaultTimePerUnit,
      defaultRatePerUnit: dto.defaultRatePerUnit,
      isActive: dto.isActive,
    });

    // Save and return
    return await this.operationRepository.save(operation);
  }
}

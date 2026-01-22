import { Injectable, Inject } from '@nestjs/common';
import { PROPERTY_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { IPropertyRepository } from '../../domain/repositories/property.repository.interface';
import { Property } from '../../domain/entities/property.entity';

/**
 * UseCase для получения всех свойств (включая неактивные)
 */
@Injectable()
export class GetAllPropertiesUseCase {
  constructor(
    @Inject(PROPERTY_REPOSITORY)
    private readonly propertyRepository: IPropertyRepository,
  ) {}

  async execute(): Promise<Property[]> {
    return await this.propertyRepository.findAll();
  }
}
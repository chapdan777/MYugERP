import { Injectable } from '@nestjs/common';
import { PropertyHeaderService } from '../../domain/services/property-header.service';
import { PropertyHeader } from '../../domain/entities/property-header.entity';

/**
 * UseCase для деактивации шапки свойств
 */
@Injectable()
export class DeactivatePropertyHeaderUseCase {
  constructor(
    private readonly propertyHeaderService: PropertyHeaderService,
  ) {}

  /**
   * Выполнение деактивации шапки
   */
  async execute(id: number): Promise<PropertyHeader> {
    return await this.propertyHeaderService.deactivateHeader(id);
  }
}
import { Injectable } from '@nestjs/common';
import { PropertyHeaderService } from '../../domain/services/property-header.service';
import { PropertyHeader } from '../../domain/entities/property-header.entity';

/**
 * UseCase для активации шапки свойств
 */
@Injectable()
export class ActivatePropertyHeaderUseCase {
  constructor(
    private readonly propertyHeaderService: PropertyHeaderService,
  ) {}

  /**
   * Выполнение активации шапки
   */
  async execute(id: number): Promise<PropertyHeader> {
    return await this.propertyHeaderService.activateHeader(id);
  }
}
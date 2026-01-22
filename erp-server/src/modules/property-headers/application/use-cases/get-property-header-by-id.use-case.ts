import { Injectable } from '@nestjs/common';
import { PropertyHeaderService } from '../../domain/services/property-header.service';
import { PropertyHeader } from '../../domain/entities/property-header.entity';

/**
 * UseCase для получения шапки свойств по ID
 */
@Injectable()
export class GetPropertyHeaderByIdUseCase {
  constructor(
    private readonly propertyHeaderService: PropertyHeaderService,
  ) {}

  /**
   * Выполнение получения шапки по ID
   */
  async execute(id: number): Promise<PropertyHeader | null> {
    return await this.propertyHeaderService.findById(id);
  }
}
import { Injectable } from '@nestjs/common';
import { PropertyHeaderService } from '../../domain/services/property-header.service';
import { PropertyHeader } from '../../domain/entities/property-header.entity';

/**
 * UseCase для получения списка всех шапок свойств
 */
@Injectable()
export class GetAllPropertyHeadersUseCase {
  constructor(
    private readonly propertyHeaderService: PropertyHeaderService,
  ) {}

  /**
   * Выполнение получения списка шапок
   */
  async execute(filters?: {
    isActive?: boolean;
    orderTypeId?: number;
  }): Promise<PropertyHeader[]> {
    return await this.propertyHeaderService.findAll(filters);
  }
}
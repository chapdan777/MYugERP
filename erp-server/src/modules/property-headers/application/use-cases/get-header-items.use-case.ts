import { Injectable } from '@nestjs/common';
import { PropertyHeaderService } from '../../domain/services/property-header.service';
import { PropertyHeaderItem } from '../../domain/entities/property-header-item.entity';

/**
 * UseCase для получения элементов шапки
 */
@Injectable()
export class GetHeaderItemsUseCase {
  constructor(
    private readonly propertyHeaderService: PropertyHeaderService,
  ) {}

  /**
   * Выполнение получения элементов шапки
   */
  async execute(headerId: number): Promise<PropertyHeaderItem[]> {
    return await this.propertyHeaderService.getHeaderItems(headerId);
  }
}
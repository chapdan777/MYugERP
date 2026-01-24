import { Injectable } from '@nestjs/common';
import { PropertyHeaderService } from '../../domain/services/property-header.service';

/**
 * UseCase для удаления элемента из шапки
 */
@Injectable()
export class RemoveItemFromHeaderUseCase {
  constructor(
    private readonly propertyHeaderService: PropertyHeaderService,
  ) {}

  /**
   * Выполнение удаления элемента из шапки
   */
  async execute(headerId: number, propertyId: number): Promise<void> {
    return await this.propertyHeaderService.removeItemFromHeader(headerId, propertyId);
  }
}
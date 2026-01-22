import { Injectable } from '@nestjs/common';
import { PropertyHeaderService } from '../../domain/services/property-header.service';

/**
 * UseCase для удаления шапки свойств
 */
@Injectable()
export class DeletePropertyHeaderUseCase {
  constructor(
    private readonly propertyHeaderService: PropertyHeaderService,
  ) {}

  /**
   * Выполнение удаления шапки
   */
  async execute(id: number): Promise<void> {
    return await this.propertyHeaderService.deleteHeader(id);
  }
}
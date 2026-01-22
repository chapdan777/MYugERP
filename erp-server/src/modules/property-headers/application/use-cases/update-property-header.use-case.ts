import { Injectable } from '@nestjs/common';
import { PropertyHeaderService } from '../../domain/services/property-header.service';
import { UpdatePropertyHeaderDto } from '../dto/update-property-header.dto';
import { PropertyHeader } from '../../domain/entities/property-header.entity';

/**
 * UseCase для обновления шапки свойств
 */
@Injectable()
export class UpdatePropertyHeaderUseCase {
  constructor(
    private readonly propertyHeaderService: PropertyHeaderService,
  ) {}

  /**
   * Выполнение обновления шапки свойств
   */
  async execute(id: number, dto: UpdatePropertyHeaderDto): Promise<PropertyHeader> {
    return await this.propertyHeaderService.updateHeader(id, {
      name: dto.name,
      description: dto.description,
    });
  }
}
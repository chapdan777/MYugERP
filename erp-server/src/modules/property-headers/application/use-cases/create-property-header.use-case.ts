import { Injectable } from '@nestjs/common';
import { PropertyHeaderService } from '../../domain/services/property-header.service';
import { CreatePropertyHeaderDto } from '../dto/create-property-header.dto';
import { PropertyHeader } from '../../domain/entities/property-header.entity';

/**
 * UseCase для создания шапки свойств
 */
@Injectable()
export class CreatePropertyHeaderUseCase {
  constructor(
    private readonly propertyHeaderService: PropertyHeaderService,
  ) {}

  /**
   * Выполнение создания шапки свойств
   */
  async execute(dto: CreatePropertyHeaderDto): Promise<PropertyHeader> {
    return await this.propertyHeaderService.createHeader({
      name: dto.name,
      orderTypeId: dto.orderTypeId,
      description: dto.description,
    });
  }
}
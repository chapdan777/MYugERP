import { Injectable } from '@nestjs/common';
import { PropertyHeaderService } from '../../domain/services/property-header.service';
import { AddItemToHeaderDto } from '../dto/add-item-to-header.dto';
import { PropertyHeaderItem } from '../../domain/entities/property-header-item.entity';

/**
 * UseCase для добавления элемента в шапку
 */
@Injectable()
export class AddItemToHeaderUseCase {
  constructor(
    private readonly propertyHeaderService: PropertyHeaderService,
  ) {}

  /**
   * Выполнение добавления элемента в шапку
   */
  async execute(headerId: number, dto: AddItemToHeaderDto): Promise<PropertyHeaderItem> {
    return await this.propertyHeaderService.addItemToHeader({
      headerId,
      propertyId: dto.propertyId,
      value: dto.value,
      sortOrder: dto.sortOrder ?? 0,
    });
  }
}
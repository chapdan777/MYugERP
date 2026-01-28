import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IPropertyHeaderItemRepository } from '../../domain/repositories/property-header-item.repository.interface';
import { PROPERTY_HEADER_ITEM_REPOSITORY } from '../../domain/repositories';
import { UpdateHeaderItemDto } from '../dto/update-header-item.dto';

@Injectable()
export class UpdateHeaderItemUseCase {
    constructor(
        @Inject(PROPERTY_HEADER_ITEM_REPOSITORY)
        private readonly propertyHeaderItemRepository: IPropertyHeaderItemRepository,
    ) { }

    async execute(headerId: number, propertyId: number, dto: UpdateHeaderItemDto): Promise<void> {
        const item = await this.propertyHeaderItemRepository.findByHeaderIdAndPropertyId(headerId, propertyId);

        if (!item) {
            // In a real scenario we might want to throw standard exceptions or return Result
            throw new NotFoundException(`Property header item not found for header ${headerId} and property ${propertyId}`);
        }

        if (dto.sortOrder !== undefined) {
            item.setSortOrder(dto.sortOrder);
        }

        await this.propertyHeaderItemRepository.save(item);
    }
}

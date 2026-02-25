import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PROPERTY_VALUE_REPOSITORY } from '../../domain/repositories/injection-tokens';
import type { IPropertyValueRepository } from '../../domain/repositories/property-value.repository.interface';

/**
 * UseCase для удаленя значения свойства
 */
@Injectable()
export class DeletePropertyValueUseCase {
    constructor(
        @Inject(PROPERTY_VALUE_REPOSITORY)
        private readonly propertyValueRepository: IPropertyValueRepository,
    ) { }

    /**
     * Выполняет удаление (деактивацию) значения свойства
     * @param id ID значения свойства
     */
    async execute(id: number): Promise<void> {
        const propertyValue = await this.propertyValueRepository.findById(id);

        if (!propertyValue) {
            throw new NotFoundException(`Значение свойства с ID ${id} не найдено`);
        }

        await this.propertyValueRepository.delete(id);
    }
}

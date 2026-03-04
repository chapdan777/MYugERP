import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { PROPERTY_DEPENDENCY_REPOSITORY, PROPERTY_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { IPropertyDependencyRepository } from '../../domain/repositories/property-dependency.repository.interface';
import { IPropertyRepository } from '../../domain/repositories/property.repository.interface';
import { PropertyDependency } from '../../domain/entities/property-dependency.entity';
import { DependencyType } from '../../domain/enums/dependency-type.enum';

interface UpdatePropertyDependencyCommand {
    id: number;
    sourcePropertyId?: number;
    targetPropertyId?: number;
    dependencyType?: DependencyType;
    sourceValue?: string | null;
    targetValue?: string | null;
    isActive?: boolean;
}

@Injectable()
export class UpdatePropertyDependencyUseCase {
    constructor(
        @Inject(PROPERTY_DEPENDENCY_REPOSITORY)
        private readonly propertyDependencyRepository: IPropertyDependencyRepository,
        @Inject(PROPERTY_REPOSITORY)
        private readonly propertyRepository: IPropertyRepository,
    ) { }

    async execute(command: UpdatePropertyDependencyCommand): Promise<PropertyDependency> {
        const dependency = await this.propertyDependencyRepository.findById(command.id);
        if (!dependency) {
            throw new NotFoundException(`Property dependency with ID ${command.id} not found`);
        }

        // Если меняются свойства, нужно убедиться, что они существуют
        if (command.sourcePropertyId !== undefined && command.sourcePropertyId !== dependency.getSourcePropertyId()) {
            const sourceProp = await this.propertyRepository.findById(command.sourcePropertyId);
            if (!sourceProp) {
                throw new NotFoundException(`Source Property ID ${command.sourcePropertyId} not found`);
            }
        }

        if (command.targetPropertyId !== undefined && command.targetPropertyId !== dependency.getTargetPropertyId()) {
            const targetProp = await this.propertyRepository.findById(command.targetPropertyId);
            if (!targetProp) {
                throw new NotFoundException(`Target Property ID ${command.targetPropertyId} not found`);
            }
        }

        dependency.update({
            sourcePropertyId: command.sourcePropertyId,
            targetPropertyId: command.targetPropertyId,
            dependencyType: command.dependencyType,
            sourceValue: command.sourceValue,
            targetValue: command.targetValue,
            isActive: command.isActive,
        });

        // Дополнительные бизнес-проверки (например, циклическая зависимость или тип=Установить значение без значения)
        if (dependency.getDependencyType() === DependencyType.SETS_VALUE && !dependency.getTargetValue()) {
            throw new BadRequestException('targetValue is required for SETS_VALUE dependency type');
        }

        if (dependency.getSourcePropertyId() === dependency.getTargetPropertyId()) {
            throw new BadRequestException('Source and target properties cannot be the same');
        }

        return this.propertyDependencyRepository.save(dependency);
    }
}

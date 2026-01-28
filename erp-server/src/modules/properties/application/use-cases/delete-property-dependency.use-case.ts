import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PROPERTY_DEPENDENCY_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { IPropertyDependencyRepository } from '../../domain/repositories/property-dependency.repository.interface';

@Injectable()
export class DeletePropertyDependencyUseCase {
    constructor(
        @Inject(PROPERTY_DEPENDENCY_REPOSITORY)
        private readonly dependencyRepository: IPropertyDependencyRepository,
    ) { }

    async execute(id: number): Promise<void> {
        const dependency = await this.dependencyRepository.findById(id);

        if (!dependency) {
            throw new NotFoundException(`Property dependency with ID ${id} not found`);
        }

        await this.dependencyRepository.delete(id);
    }
}

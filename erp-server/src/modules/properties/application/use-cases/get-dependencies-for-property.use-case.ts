import { Injectable, Inject } from '@nestjs/common';
import { PROPERTY_DEPENDENCY_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { IPropertyDependencyRepository } from '../../domain/repositories/property-dependency.repository.interface';
import { PropertyDependency } from '../../domain/entities/property-dependency.entity';

@Injectable()
export class GetDependenciesForPropertyUseCase {
  constructor(
    @Inject(PROPERTY_DEPENDENCY_REPOSITORY)
    private readonly dependencyRepository: IPropertyDependencyRepository,
  ) {}

  async execute(propertyId: number): Promise<{
    asSource: PropertyDependency[];
    asTarget: PropertyDependency[];
  }> {
    const [asSource, asTarget] = await Promise.all([
      this.dependencyRepository.findBySourcePropertyId(propertyId),
      this.dependencyRepository.findByTargetPropertyId(propertyId),
    ]);

    return { asSource, asTarget };
  }
}

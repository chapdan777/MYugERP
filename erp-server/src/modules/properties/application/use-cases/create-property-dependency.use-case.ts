import { Injectable, Inject } from '@nestjs/common';
import { PROPERTY_DEPENDENCY_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { IPropertyDependencyRepository } from '../../domain/repositories/property-dependency.repository.interface';
import { PropertyDependency } from '../../domain/entities/property-dependency.entity';
import { DependencyType } from '../../domain/enums/dependency-type.enum';

export interface CreatePropertyDependencyDto {
  sourcePropertyId: number;
  targetPropertyId: number;
  dependencyType: DependencyType;
  sourceValue?: string;
  targetValue?: string;
}

@Injectable()
export class CreatePropertyDependencyUseCase {
  constructor(
    @Inject(PROPERTY_DEPENDENCY_REPOSITORY)
    private readonly dependencyRepository: IPropertyDependencyRepository,
  ) {}

  async execute(dto: CreatePropertyDependencyDto): Promise<PropertyDependency> {
    // Создание зависимости через фабричный метод (с валидацией)
    const dependency = PropertyDependency.create({
      sourcePropertyId: dto.sourcePropertyId,
      targetPropertyId: dto.targetPropertyId,
      dependencyType: dto.dependencyType,
      sourceValue: dto.sourceValue ?? null,
      targetValue: dto.targetValue ?? null,
    });

    return await this.dependencyRepository.save(dependency);
  }
}

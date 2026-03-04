import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { CreatePropertyDependencyRequestDto, PropertyDependencyResponseDto, UpdatePropertyDependencyRequestDto } from './dtos/property-dependency.dto';
import { CreatePropertyDependencyUseCase } from '../application/use-cases/create-property-dependency.use-case';
import { UpdatePropertyDependencyUseCase } from '../application/use-cases/update-property-dependency.use-case';
import { GetDependenciesForPropertyUseCase } from '../application/use-cases/get-dependencies-for-property.use-case';
import { PropertyDependency } from '../domain/entities/property-dependency.entity';

import { DeletePropertyDependencyUseCase } from '../application/use-cases/delete-property-dependency.use-case';

@Controller('property-dependencies')
export class PropertyDependenciesController {
  constructor(
    private readonly createPropertyDependencyUseCase: CreatePropertyDependencyUseCase,
    private readonly updatePropertyDependencyUseCase: UpdatePropertyDependencyUseCase,
    private readonly getDependenciesForPropertyUseCase: GetDependenciesForPropertyUseCase,
    private readonly deletePropertyDependencyUseCase: DeletePropertyDependencyUseCase,
  ) { }

  @Post()
  async create(@Body() dto: CreatePropertyDependencyRequestDto): Promise<PropertyDependencyResponseDto> {
    const dependency = await this.createPropertyDependencyUseCase.execute({
      sourcePropertyId: dto.sourcePropertyId,
      targetPropertyId: dto.targetPropertyId,
      dependencyType: dto.dependencyType,
      sourceValue: dto.sourceValue,
      targetValue: dto.targetValue,
    });

    return this.mapToResponse(dependency);
  }

  @Get('property/:propertyId')
  async getDependenciesForProperty(@Param('propertyId', ParseIntPipe) propertyId: number): Promise<{
    asSource: PropertyDependencyResponseDto[];
    asTarget: PropertyDependencyResponseDto[];
  }> {
    const result = await this.getDependenciesForPropertyUseCase.execute(propertyId);

    return {
      asSource: result.asSource.map(d => this.mapToResponse(d)),
      asTarget: result.asTarget.map(d => this.mapToResponse(d)),
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePropertyDependencyRequestDto,
  ): Promise<PropertyDependencyResponseDto> {
    const dependency = await this.updatePropertyDependencyUseCase.execute({
      id,
      sourcePropertyId: dto.sourcePropertyId,
      targetPropertyId: dto.targetPropertyId,
      dependencyType: dto.dependencyType,
      sourceValue: dto.sourceValue,
      targetValue: dto.targetValue,
      isActive: dto.isActive,
    });

    return this.mapToResponse(dependency);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.deletePropertyDependencyUseCase.execute(id);
  }

  private mapToResponse(dependency: PropertyDependency): PropertyDependencyResponseDto {
    return {
      id: dependency.getId()!,
      sourcePropertyId: dependency.getSourcePropertyId(),
      targetPropertyId: dependency.getTargetPropertyId(),
      dependencyType: dependency.getDependencyType(),
      sourceValue: dependency.getSourceValue(),
      targetValue: dependency.getTargetValue(),
      isActive: dependency.getIsActive(),
      createdAt: dependency.getCreatedAt(),
    };
  }
}

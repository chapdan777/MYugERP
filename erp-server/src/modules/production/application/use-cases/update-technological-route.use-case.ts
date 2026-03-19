import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { TECHNOLOGICAL_ROUTE_REPOSITORY, ITechnologicalRouteRepository } from '../../domain/repositories/technological-route.repository.interface';
import { UpdateTechnologicalRouteDto } from '../../presentation/dtos/technological-route.dto';
import { TechnologicalRoute } from '../../domain/entities/technological-route.entity';
import { RouteStep } from '../../domain/entities/route-step.entity';
import { OperationMaterial } from '../../domain/entities/operation-material.entity';

@Injectable()
export class UpdateTechnologicalRouteUseCase {
    constructor(
        @Inject(TECHNOLOGICAL_ROUTE_REPOSITORY)
        private readonly routeRepository: ITechnologicalRouteRepository,
    ) { }

    async execute(id: number, dto: UpdateTechnologicalRouteDto): Promise<TechnologicalRoute> {
        const route = await this.routeRepository.findById(id);
        if (!route) {
            throw new NotFoundException(`Технологический маршрут с ID ${id} не найден`);
        }

        // Обновляем базовую информацию
        route.updateInfo({
            name: dto.name,
            description: dto.description,
            isActive: dto.isActive,
        });

        // Если переданы шаги (даже пустой массив), заменяем существующие
        if (dto.steps !== undefined) {
            const newSteps = dto.steps.map(stepDto => {
                const materials = stepDto.materials?.map(matDto =>
                    OperationMaterial.create({
                        operationId: stepDto.operationId,
                        materialId: matDto.materialId,
                        consumptionFormula: matDto.consumptionFormula,
                        unit: matDto.unit || 'шт',
                    })
                ) || [];

                return RouteStep.create({
                    routeId: id,
                    operationId: stepDto.operationId,
                    stepNumber: stepDto.stepNumber,
                    isRequired: stepDto.isRequired,
                    conditionFormula: stepDto.conditionFormula || null,
                    materials,
                });
            });

            route.replaceSteps(newSteps);
        }

        return await this.routeRepository.save(route);
    }
}

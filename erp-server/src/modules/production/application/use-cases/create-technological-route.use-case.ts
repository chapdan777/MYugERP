import { Inject, Injectable } from '@nestjs/common';
import { ITechnologicalRouteRepository, TECHNOLOGICAL_ROUTE_REPOSITORY } from '../../domain/repositories/technological-route.repository.interface';
import { CreateTechnologicalRouteDto } from '../../presentation/dtos/technological-route.dto';
import { TechnologicalRoute } from '../../domain/entities/technological-route.entity';
import { RouteStep } from '../../domain/entities/route-step.entity';
import { OperationMaterial } from '../../domain/entities/operation-material.entity';

@Injectable()
export class CreateTechnologicalRouteUseCase {
    constructor(
        @Inject(TECHNOLOGICAL_ROUTE_REPOSITORY)
        private readonly repository: ITechnologicalRouteRepository,
    ) { }

    async execute(dto: CreateTechnologicalRouteDto): Promise<TechnologicalRoute> {
        // 1. Деактивация существующего маршрута (только для обычных маршрутов, не шаблонов)
        if (!dto.isTemplate && dto.productId > 0) {
            const existingActive = await this.repository.findActiveByProductId(dto.productId);
            if (existingActive) {
                existingActive.updateInfo({ isActive: false });
                await this.repository.save(existingActive);
            }
        }

        // 2. Создание нового маршрута
        const route = TechnologicalRoute.create({
            productId: dto.isTemplate ? 0 : dto.productId,
            name: dto.name,
            description: dto.description,
            isActive: true,
            isTemplate: dto.isTemplate ?? false,
        });

        // 3. Add steps
        dto.steps.forEach(stepDto => {
            const materials = stepDto.materials?.map(matDto => OperationMaterial.create({
                operationId: stepDto.operationId,
                materialId: matDto.materialId,
                consumptionFormula: matDto.consumptionFormula,
                unit: matDto.unit || 'шт', // Default unit if missing
            }));

            const step = RouteStep.create({
                routeId: 0,
                operationId: stepDto.operationId,
                stepNumber: stepDto.stepNumber,
                isRequired: stepDto.isRequired,
                conditionFormula: stepDto.conditionFormula || null,
                materials: materials,
            });

            route.addStep(step);
        });

        // 4. Save
        return this.repository.save(route);
    }
}

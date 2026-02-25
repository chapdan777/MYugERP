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
        // 1. Deactivate existing active route if needed
        const existingActive = await this.repository.findActiveByProductId(dto.productId);
        if (existingActive) {
            existingActive.updateInfo({ isActive: false });
            await this.repository.save(existingActive);
        }

        // 2. Create new route
        const route = TechnologicalRoute.create({
            productId: dto.productId,
            name: dto.name,
            description: dto.description,
            isActive: true,
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
                routeId: 0, // Temporary ID, will be set by persistence? No, entity needs it. But route ID is unknown before save? 
                // Domain usually doesn't need routeId if aggregated. But TypeORM needs it. 
                // In my entity design, 'routeId' is part of RouteStep props. 
                // However, valid aggregation creation often relies on ID being generated later.
                // We can pass 0 or mock ID, and TypeORM cascade will handle foreign key assignment.
                operationId: stepDto.operationId,
                stepNumber: stepDto.stepNumber,
                isRequired: stepDto.isRequired,
                materials: materials,
            });

            route.addStep(step);
        });

        // 4. Save
        return this.repository.save(route);
    }
}

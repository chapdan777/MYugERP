import { TechnologicalRoute } from '../../../domain/entities/technological-route.entity';
import { RouteStep } from '../../../domain/entities/route-step.entity';
import { TechnologicalRouteEntity } from '../entities/technological-route.entity';
import { RouteStepEntity } from '../entities/route-step.entity';

import { OperationMaterial } from '../../../domain/entities/operation-material.entity';
import { RouteStepMaterialEntity } from '../entities/route-step-material.entity';

export class TechnologicalRouteMapper {
    static toDomain(entity: TechnologicalRouteEntity): TechnologicalRoute {
        const steps = entity.steps
            ? entity.steps.map((step) => TechnologicalRouteMapper.toDomainStep(step))
            : [];

        return TechnologicalRoute.restore({
            id: entity.id,
            productId: entity.productId,
            name: entity.name,
            description: entity.description || null,
            isActive: entity.isActive,
            steps: steps,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        });
    }

    static toDomainStep(entity: RouteStepEntity): RouteStep {
        const materials = entity.materials
            ? entity.materials.map(m => OperationMaterial.restore({
                id: m.id,
                operationId: entity.operationId,
                materialId: m.materialId,
                consumptionFormula: m.consumptionFormula,
                unit: m.unit
            }))
            : [];

        return RouteStep.restore({
            id: entity.id,
            routeId: entity.routeId,
            operationId: entity.operationId,
            stepNumber: entity.stepNumber,
            description: entity.description || null,
            isRequired: entity.isRequired,
            materials: materials,
            createdAt: new Date(), // Step entity doesn't have createdAt usually
            updatedAt: new Date(),
        });
    }

    static toPersistence(domain: TechnologicalRoute): TechnologicalRouteEntity {
        const entity = new TechnologicalRouteEntity();
        if (domain.getId()) {
            entity.id = domain.getId() as number;
        }
        entity.productId = domain.getProductId();
        entity.name = domain.getName();
        entity.description = domain.getDescription();
        entity.isActive = domain.getIsActive();
        entity.steps = domain.getSteps().map((step: RouteStep) => TechnologicalRouteMapper.toPersistenceStep(step));
        entity.createdAt = domain.getCreatedAt();
        entity.updatedAt = domain.getUpdatedAt();
        return entity;
    }

    static toPersistenceStep(domain: RouteStep): RouteStepEntity {
        const entity = new RouteStepEntity();
        if (domain.getId()) {
            entity.id = domain.getId() as number;
        }
        entity.routeId = domain.getRouteId();
        entity.operationId = domain.getOperationId();
        entity.stepNumber = domain.getStepNumber();
        entity.description = domain.getDescription();
        entity.isRequired = domain.getIsRequired();

        entity.materials = domain.getMaterials().map(m => {
            const materialEntity = new RouteStepMaterialEntity();
            if (m.getId()) materialEntity.id = m.getId() as number;
            materialEntity.materialId = m.getMaterialId();
            materialEntity.consumptionFormula = m.getConsumptionFormula();
            materialEntity.unit = m.getUnit();
            return materialEntity;
        });

        return entity;
    }
}

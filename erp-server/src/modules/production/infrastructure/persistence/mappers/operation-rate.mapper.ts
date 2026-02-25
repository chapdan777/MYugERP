import { OperationRate } from '../../../domain/entities/operation-rate.entity';
import { OperationRateEntity } from '../entities/operation-rate.entity';

export class OperationRateMapper {
    static toDomain(entity: OperationRateEntity): OperationRate {
        return OperationRate.restore({
            id: entity.id,
            operationId: entity.operationId,
            propertyValueId: entity.propertyValueId,
            ratePerUnit: Number(entity.ratePerUnit), // Decimal returns string usually
            timePerUnit: Number(entity.timePerUnit),
            isActive: entity.isActive,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        });
    }

    static toPersistence(domain: OperationRate): OperationRateEntity {
        const entity = new OperationRateEntity();
        if (domain.getId()) {
            entity.id = domain.getId() as number;
        }
        entity.operationId = domain.getOperationId();
        entity.propertyValueId = domain.getPropertyValueId();
        entity.ratePerUnit = domain.getRatePerUnit();
        entity.timePerUnit = domain.getTimePerUnit();
        entity.isActive = domain.getIsActive();
        entity.createdAt = domain.getCreatedAt();
        entity.updatedAt = domain.getUpdatedAt();
        return entity;
    }
}

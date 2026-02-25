import { Operation } from '../../../domain/entities/operation.entity';
import { OperationEntity } from '../entities/operation.entity';

/**
 * Маппер для преобразования между доменной и ORM сущностями Operation
 */
export class OperationMapper {
    /**
     * Преобразовать ORM сущность в доменную
     */
    static toDomain(entity: OperationEntity): Operation {
        return Operation.restore({
            id: entity.id,
            code: entity.code,
            name: entity.name,
            description: entity.description,
            calculationType: entity.calculationType,
            defaultTimePerUnit: Number(entity.defaultTimePerUnit),
            defaultRatePerUnit: Number(entity.defaultRatePerUnit),
            isActive: entity.isActive,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        });
    }

    /**
     * Преобразовать доменную сущность в ORM
     */
    static toPersistence(domain: Operation): Partial<OperationEntity> {
        return {
            id: domain.getId(),
            code: domain.getCode(),
            name: domain.getName(),
            description: domain.getDescription(),
            calculationType: domain.getCalculationType(),
            defaultTimePerUnit: domain.getDefaultTimePerUnit(),
            defaultRatePerUnit: domain.getDefaultRatePerUnit(),
            isActive: domain.getIsActive(),
        };
    }
}

import { ProductionDepartment } from '../../../domain/entities/production-department.entity';
import { DepartmentOperation } from '../../../domain/entities/department-operation.entity';
import { ProductionDepartmentEntity } from '../entities/production-department.entity';
import { DepartmentOperationEntity } from '../entities/department-operation.entity';

export class ProductionDepartmentMapper {
    static toDomain(entity: ProductionDepartmentEntity): ProductionDepartment {
        return ProductionDepartment.restore(
            entity.id,
            entity.code,
            entity.name,
            entity.description || null,
            entity.groupingStrategy,
            entity.groupingPropertyId,
            entity.isActive,
            entity.createdAt,
            entity.updatedAt,
        );
    }

    static toDomainOperation(entity: DepartmentOperationEntity): DepartmentOperation {
        return DepartmentOperation.restore(
            entity.id,
            entity.departmentId,
            entity.operationId,
            entity.priority,
            entity.isActive,
            entity.createdAt,
            entity.updatedAt,
        );
    }

    static toPersistence(domain: ProductionDepartment): ProductionDepartmentEntity {
        const entity = new ProductionDepartmentEntity();
        if (domain.getId()) {
            entity.id = domain.getId() as number;
        }
        entity.code = domain.getCode();
        entity.name = domain.getName();
        entity.description = domain.getDescription();
        entity.groupingStrategy = domain.getGroupingStrategy();
        entity.groupingPropertyId = domain.getGroupingPropertyId();
        entity.isActive = domain.getIsActive();
        entity.createdAt = domain.getCreatedAt();
        entity.updatedAt = domain.getUpdatedAt();
        return entity;
    }
}

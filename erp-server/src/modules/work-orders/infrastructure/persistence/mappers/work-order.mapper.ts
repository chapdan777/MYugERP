import { WorkOrder } from '../../../domain/entities/work-order.entity';
import { WorkOrderItem } from '../../../domain/entities/work-order-item.entity';
import { WorkOrderEntity } from '../entities/work-order.entity';
import { WorkOrderItemEntity } from '../entities/work-order-item.entity';

export class WorkOrderMapper {
    static toDomain(entity: WorkOrderEntity): WorkOrder {
        const items = entity.items
            ? entity.items.map((itemEntity) => WorkOrderMapper.toDomainItem(itemEntity))
            : [];

        return WorkOrder.restore(
            entity.id,
            entity.workOrderNumber,
            entity.orderId,
            entity.orderNumber,
            entity.departmentId,
            entity.departmentName,
            entity.operationId,
            entity.operationName,
            entity.status,
            entity.priority,
            entity.priorityOverride,
            entity.priorityOverrideReason,
            entity.deadline,
            entity.assignedAt,
            entity.startedAt,
            entity.completedAt,
            items,
            entity.notes,
            entity.createdAt,
            entity.updatedAt,
        );
    }

    static toDomainItem(entity: WorkOrderItemEntity): WorkOrderItem {
        // Handling jsonb calculation materials which might be object or null
        // Domain expects string | null for restore (to be parsed by getter)
        const materials = entity.calculatedMaterials
            ? (typeof entity.calculatedMaterials === 'string' ? entity.calculatedMaterials : JSON.stringify(entity.calculatedMaterials))
            : null;

        return WorkOrderItem.restore(
            entity.id,
            entity.workOrderId,
            entity.orderItemId,
            entity.productId,
            entity.productName,
            entity.operationId,
            entity.operationName,
            entity.quantity,
            entity.unit,
            entity.estimatedHours,
            entity.pieceRate,
            entity.actualHours,
            materials,
            entity.createdAt,
            entity.updatedAt,
        );
    }

    static toPersistence(domain: WorkOrder): WorkOrderEntity {
        const entity = new WorkOrderEntity();
        if (domain.getId()) {
            entity.id = domain.getId() as number;
        }
        entity.workOrderNumber = domain.getWorkOrderNumber();
        entity.orderId = domain.getOrderId();
        entity.orderNumber = domain.getOrderNumber();
        entity.departmentId = domain.getDepartmentId();
        entity.departmentName = domain.getDepartmentName();
        entity.operationId = domain.getOperationId();
        entity.operationName = domain.getOperationName();
        entity.status = domain.getStatus();
        entity.priority = domain.getPriority();
        entity.priorityOverride = domain.getPriorityOverride();
        entity.priorityOverrideReason = domain.getPriorityOverrideReason();
        entity.deadline = domain.getDeadline();
        entity.assignedAt = domain.getAssignedAt();
        entity.startedAt = domain.getStartedAt();
        entity.completedAt = domain.getCompletedAt();
        entity.notes = domain.getNotes();
        entity.items = domain.getItems().map((item) => WorkOrderMapper.toPersistenceItem(item));
        entity.createdAt = domain.getCreatedAt();
        entity.updatedAt = domain.getUpdatedAt();
        return entity;
    }

    static toPersistenceItem(domain: WorkOrderItem): WorkOrderItemEntity {
        const entity = new WorkOrderItemEntity();
        if (domain.getId()) {
            entity.id = domain.getId() as number;
        }
        entity.workOrderId = domain.getWorkOrderId();
        entity.orderItemId = domain.getOrderItemId();
        entity.productId = domain.getProductId();
        entity.productName = domain.getProductName();
        entity.operationId = domain.getOperationId();
        entity.operationName = domain.getOperationName();
        entity.quantity = domain.getQuantity();
        entity.unit = domain.getUnit();
        entity.estimatedHours = domain.getEstimatedHours();
        entity.pieceRate = domain.getPieceRate();
        entity.actualHours = domain.getActualHours();
        entity.calculatedMaterials = domain.getCalculatedMaterials(); // Accessor returns object or null
        entity.createdAt = domain.getCreatedAt();
        entity.updatedAt = domain.getUpdatedAt();
        return entity;
    }
}

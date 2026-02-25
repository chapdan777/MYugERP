import { OrderPaymentAllocation } from '../../../domain/entities/order-payment-allocation.entity';
import { OrderPaymentAllocationEntity } from '../entities/order-payment-allocation.entity';

export class OrderPaymentAllocationMapper {
    static toDomain(entity: OrderPaymentAllocationEntity): OrderPaymentAllocation {
        return OrderPaymentAllocation.restore({
            id: entity.id,
            clientId: entity.clientId,
            clientName: 'Unknown', // Placeholder, entity doesn't store this
            orderId: entity.orderId,
            orderNumber: entity.orderNumber,
            allocatedAmount: Number(entity.allocatedAmount),
            allocationDate: entity.allocatedAt,
            allocatedBy: entity.allocatedBy,
            notes: entity.notes,
            isActive: !entity.isCancelled,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        });
    }

    static toPersistence(domain: OrderPaymentAllocation): OrderPaymentAllocationEntity {
        const entity = new OrderPaymentAllocationEntity();
        if (domain.getId()) {
            entity.id = domain.getId()!;
        }
        entity.clientId = domain.getClientId();
        entity.orderId = domain.getOrderId();
        entity.orderNumber = domain.getOrderNumber();
        entity.paymentId = 0; // Placeholder as domain entity lacks this
        entity.allocatedAmount = domain.getAllocatedAmount();
        entity.allocatedBy = domain.getAllocatedBy();
        entity.allocatedAt = domain.getAllocationDate();
        entity.notes = domain.getNotes() || null;
        entity.isCancelled = !domain.getIsActive();
        if (domain.getCreatedAt()) entity.createdAt = domain.getCreatedAt();
        if (domain.getUpdatedAt()) entity.updatedAt = domain.getUpdatedAt();
        return entity;
    }
}

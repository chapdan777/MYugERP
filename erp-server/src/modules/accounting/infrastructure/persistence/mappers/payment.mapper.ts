import { Payment, PaymentMethod } from '../../../domain/entities/payment.entity';
import { PaymentEntity } from '../entities/payment.entity';

export class PaymentMapper {
    static toDomain(entity: PaymentEntity): Payment {
        return Payment.restore({
            id: entity.id,
            clientId: entity.clientId,
            clientName: entity.clientName,
            amount: Number(entity.amount),
            paymentMethod: entity.paymentMethod as PaymentMethod,
            paymentDate: entity.paymentDate,
            referenceNumber: entity.referenceNumber,
            notes: entity.notes,
            registeredBy: entity.registeredBy,
            registeredAt: entity.registeredAt,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        });
    }

    static toPersistence(domain: Payment): PaymentEntity {
        const entity = new PaymentEntity();
        if (domain.getId()) {
            entity.id = domain.getId()!;
        }
        entity.clientId = domain.getClientId();
        entity.clientName = domain.getClientName();
        entity.amount = domain.getAmount();
        entity.paymentMethod = domain.getPaymentMethod();
        entity.paymentDate = domain.getPaymentDate();
        entity.referenceNumber = domain.getReferenceNumber() || null;
        entity.notes = domain.getNotes() || null;
        entity.registeredBy = domain.getRegisteredBy();
        entity.registeredAt = domain.getRegisteredAt();
        // createdAt and updatedAt are handled by DB or explicit logic, but domain has them.
        // Usually persistence layer ignores them on create (db default) or updates them on save if needed.
        // For update, we might need them.
        if (domain.getCreatedAt()) entity.createdAt = domain.getCreatedAt();
        if (domain.getUpdatedAt()) entity.updatedAt = domain.getUpdatedAt();
        return entity;
    }
}

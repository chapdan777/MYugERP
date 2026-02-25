import { ClientBalance } from '../../../domain/entities/client-balance.entity';
import { ClientBalanceEntity } from '../entities/client-balance.entity';

export class ClientBalanceMapper {
    static toDomain(entity: ClientBalanceEntity): ClientBalance {
        return ClientBalance.restore({
            id: entity.id,
            clientId: entity.clientId,
            clientName: entity.clientName,
            totalPaid: Number(entity.totalPaid),
            totalAllocated: Number(entity.totalAllocated),
            balance: Number(entity.balance),
            lastPaymentDate: entity.lastPaymentDate,
            lastAllocationDate: entity.lastAllocationDate,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        });
    }

    static toPersistence(domain: ClientBalance): ClientBalanceEntity {
        const entity = new ClientBalanceEntity();
        if (domain.getId()) {
            entity.id = domain.getId()!;
        }
        entity.clientId = domain.getClientId();
        entity.clientName = domain.getClientName();
        entity.totalPaid = domain.getTotalPaid();
        entity.totalAllocated = domain.getTotalAllocated();
        entity.balance = domain.getBalance();
        entity.lastPaymentDate = domain.getLastPaymentDate() || null;
        entity.lastAllocationDate = domain.getLastAllocationDate() || null;

        // TypeORM handles defaults for nullable fields if not set, but explicit is better
        if (domain.getCreatedAt()) entity.createdAt = domain.getCreatedAt();
        if (domain.getUpdatedAt()) entity.updatedAt = domain.getUpdatedAt();

        return entity;
    }
}

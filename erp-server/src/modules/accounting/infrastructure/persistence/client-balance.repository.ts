import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IClientBalanceRepository } from '../../domain/repositories/client-balance.repository.interface';
import { ClientBalance } from '../../domain/entities/client-balance.entity';
import { ClientBalanceEntity } from './entities/client-balance.entity';
import { ClientBalanceMapper } from './mappers/client-balance.mapper';

@Injectable()
export class ClientBalanceRepository implements IClientBalanceRepository {
    constructor(
        @InjectRepository(ClientBalanceEntity)
        private readonly repository: Repository<ClientBalanceEntity>,
    ) { }

    async findByClientId(clientId: number): Promise<ClientBalance | null> {
        const entity = await this.repository.findOne({ where: { clientId } });
        return entity ? ClientBalanceMapper.toDomain(entity) : null;
    }

    async findAll(): Promise<ClientBalance[]> {
        const entities = await this.repository.find();
        return entities.map(ClientBalanceMapper.toDomain);
    }

    async findAllWithPagination(
        page: number,
        limit: number,
    ): Promise<{ balances: ClientBalance[]; total: number }> {
        const [entities, total] = await this.repository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
            order: { clientId: 'ASC' },
        });
        return {
            balances: entities.map(ClientBalanceMapper.toDomain),
            total,
        };
    }

    async save(balance: ClientBalance): Promise<ClientBalance> {
        const entity = ClientBalanceMapper.toPersistence(balance);
        const savedEntity = await this.repository.save(entity);
        return ClientBalanceMapper.toDomain(savedEntity);
    }

    async findById(id: number): Promise<ClientBalance | null> {
        const entity = await this.repository.findOne({ where: { id } });
        return entity ? ClientBalanceMapper.toDomain(entity) : null;
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }
}

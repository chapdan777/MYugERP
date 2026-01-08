import { ClientBalance } from '../entities/client-balance.entity';

export const CLIENT_BALANCE_REPOSITORY = Symbol('CLIENT_BALANCE_REPOSITORY');

export abstract class IClientBalanceRepository {
  abstract save(clientBalance: ClientBalance): Promise<ClientBalance>;
  abstract findById(id: number): Promise<ClientBalance | null>;
  abstract findByClientId(clientId: number): Promise<ClientBalance | null>;
  abstract findAll(): Promise<ClientBalance[]>;
  abstract findAllWithPagination(
    page: number,
    limit: number,
  ): Promise<{ balances: ClientBalance[]; total: number }>;
  abstract delete(id: number): Promise<void>;
}

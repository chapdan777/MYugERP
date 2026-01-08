import { Payment } from '../entities/payment.entity';

export const PAYMENT_REPOSITORY = Symbol('PAYMENT_REPOSITORY');

export abstract class IPaymentRepository {
  abstract save(payment: Payment): Promise<Payment>;
  abstract findById(id: number): Promise<Payment | null>;
  abstract findByClientId(clientId: number): Promise<Payment[]>;
  abstract findByClientIdWithPagination(
    clientId: number,
    page: number,
    limit: number,
  ): Promise<{ payments: Payment[]; total: number }>;
  abstract findByReferenceNumber(referenceNumber: string): Promise<Payment | null>;
  abstract findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Payment[]>;
  abstract findByClientIdAndDateRange(
    clientId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Payment[]>;
  abstract delete(id: number): Promise<void>;
}

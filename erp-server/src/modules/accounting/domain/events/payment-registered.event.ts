import { PaymentMethod } from '../entities/payment.entity';

/**
 * PaymentRegistered Event
 * 
 * Emitted when a payment is registered in the system
 */
export class PaymentRegisteredEvent {
  constructor(
    public readonly paymentId: number,
    public readonly clientId: number,
    public readonly clientName: string,
    public readonly amount: number,
    public readonly paymentMethod: PaymentMethod,
    public readonly paymentDate: Date,
    public readonly registeredBy: number,
    public readonly registeredAt: Date,
  ) {}
}

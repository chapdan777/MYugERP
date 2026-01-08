/**
 * PaymentAllocated Event
 * 
 * Emitted when a payment is allocated to an order
 */
export class PaymentAllocatedEvent {
  constructor(
    public readonly allocationId: number,
    public readonly clientId: number,
    public readonly orderId: number,
    public readonly orderNumber: string,
    public readonly allocatedAmount: number,
    public readonly allocationDate: Date,
    public readonly allocatedBy: number,
  ) {}
}

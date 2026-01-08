/**
 * PaymentAllocationCancelled Event
 * 
 * Emitted when a payment allocation is cancelled
 */
export class PaymentAllocationCancelledEvent {
  constructor(
    public readonly allocationId: number,
    public readonly clientId: number,
    public readonly orderId: number,
    public readonly allocatedAmount: number,
    public readonly cancelledAt: Date,
  ) {}
}

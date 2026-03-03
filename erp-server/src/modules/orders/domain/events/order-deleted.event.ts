/**
 * @file Event payload triggered when an Order is deleted
 */
export class OrderDeletedEvent {
    constructor(
        public readonly orderId: number,
    ) { }
}

/**
 * Событие деактивации продукта
 */
export class ProductDeactivatedEvent {
    constructor(
        public readonly productId: number,
    ) { }
}

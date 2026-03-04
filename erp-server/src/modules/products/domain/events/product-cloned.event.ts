/**
 * Событие клонирования продукта
 */
export class ProductClonedEvent {
    constructor(
        public readonly originalProductId: number,
        public readonly newProductId: number,
    ) { }
}

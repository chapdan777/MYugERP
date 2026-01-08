/**
 * OrderStatus - статусы заказа
 */
export enum OrderStatus {
  DRAFT = 'draft',                    // Черновик
  CONFIRMED = 'confirmed',            // Подтвержден
  IN_PRODUCTION = 'in_production',    // В производстве
  READY = 'ready',                    // Готов
  DELIVERED = 'delivered',            // Доставлен
  CANCELLED = 'cancelled',            // Отменен
}

/**
 * PaymentStatus - статусы оплаты заказа
 */
export enum PaymentStatus {
  UNPAID = 'unpaid',           // Не оплачен
  PARTIALLY_PAID = 'partially_paid',  // Частично оплачен
  PAID = 'paid',               // Полностью оплачен
}

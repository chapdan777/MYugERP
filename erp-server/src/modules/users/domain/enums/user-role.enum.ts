/**
 * Роли пользователей в системе
 */
export enum UserRole {
  CLIENT = 'client',     // Клиент - может создавать заказы, просматривать свои заказы
  MANAGER = 'manager',   // Менеджер - управление заказами, клиентами, ценами
  WORKER = 'worker',     // Работник - выполнение производственных заказ-нарядов
  ADMIN = 'admin',       // Администратор - полный доступ ко всей системе
}

/**
 * Проверка валидности роли
 */
export function isValidUserRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

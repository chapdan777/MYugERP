import { SetMetadata } from '@nestjs/common';

/**
 * Ключ для хранения метаданных ролей
 */
export const ROLES_KEY = 'roles';

/**
 * Декоратор для указания ролей, необходимых для доступа к эндпоинту
 * 
 * @example
 * @Roles('admin', 'manager')
 * @Get('sensitive-data')
 * getSensitiveData() {
 *   return this.service.getSensitiveData();
 * }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

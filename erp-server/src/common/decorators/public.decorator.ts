import { SetMetadata } from '@nestjs/common';

/**
 * Ключ для хранения метаданных публичного доступа
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Декоратор для маркировки эндпоинта как публичного (без аутентификации)
 * 
 * @example
 * @Public()
 * @Post('register')
 * register(@Body() dto: RegisterDto) {
 *   return this.authService.register(dto);
 * }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

import { registerAs } from '@nestjs/config';

/**
 * Конфигурация JWT токенов
 */
export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'default-secret',
  expiresIn: process.env.JWT_EXPIRATION || '15m',
  refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'default-refresh-secret',
  refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d',
}));

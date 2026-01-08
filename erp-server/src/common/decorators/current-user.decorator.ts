import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Интерфейс пользователя из JWT токена
 */
export interface JwtPayload {
  sub: number; // user ID
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Декоратор для получения текущего пользователя из запроса
 * Пользователь добавляется в запрос после успешной аутентификации JWT
 * 
 * @example
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: JwtPayload) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

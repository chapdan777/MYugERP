import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, AuthResponseDto, RefreshResponseDto } from './dto';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RefreshTokenPayload } from './strategies/jwt-refresh.strategy';

/**
 * Локальное определение JwtPayload для соответствия strict mode
 */
interface JwtPayload {
  sub: number;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Контроллер аутентификации
 * Предоставляет endpoints для login, refresh, logout
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   * Аутентификация пользователя через username/password
   * @returns Access и Refresh токены + информация о пользователе
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    // TODO: После реализации User модуля, использовать LocalAuthGuard
    // и получать user из @CurrentUser()
    
    // Временная заглушка для демонстрации структуры
    // const user = await this.authService.validateUser(loginDto.username, loginDto.password);
    
    // Заглушка с тестовыми данными
    const mockUser = {
      id: 1,
      username: loginDto.username,
      role: 'admin',
    };

    const tokens = await this.authService.generateTokens(
      mockUser.id,
      mockUser.username,
      mockUser.role,
    );

    return {
      ...tokens,
      user: {
        id: mockUser.id,
        username: mockUser.username,
        role: mockUser.role,
      },
    };
  }

  /**
   * POST /auth/refresh
   * Обновление access токена через refresh токен
   * @returns Новый access токен
   */
  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @CurrentUser() user: RefreshTokenPayload & { refreshToken: string },
  ): Promise<RefreshResponseDto> {
    // TODO: После реализации User модуля, проверять refresh token в БД
    // и возможность его использования (не отозван ли)
    
    // Получаем пользователя из БД по ID для актуальной роли
    // const fullUser = await this.userService.findById(user.sub);
    
    // Временная заглушка
    const mockRole = 'admin';

    const accessToken = await this.authService.refreshAccessToken(
      user.sub,
      user.username,
      mockRole,
    );

    return { accessToken };
  }

  /**
   * POST /auth/logout
   * Выход пользователя из системы
   * TODO: Реализовать отзыв refresh токена (blacklist или удаление из БД)
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() _user: JwtPayload): Promise<{ message: string }> {
    // TODO: Добавить логику отзыва refresh токена
    // await this.authService.revokeRefreshToken(user.sub);
    
    return {
      message: 'Успешный выход из системы',
    };
  }

  /**
   * GET /auth/me
   * Получение информации о текущем пользователе
   * Используется для проверки валидности токена
   */
  @Get('me')
  async getProfile(@CurrentUser() user: JwtPayload): Promise<JwtPayload> {
    // TODO: После реализации User модуля, возвращать полную информацию
    // const fullUser = await this.userService.findById(user.sub);
    return user;
  }
}

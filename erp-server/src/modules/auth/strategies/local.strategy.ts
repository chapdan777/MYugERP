import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

/**
 * Local Strategy для логина через username/password
 * Используется на endpoint'е /auth/login
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      usernameField: 'username',
      passwordField: 'password',
    });
  }

  /**
   * Метод для валидации учетных данных
   * В реальном приложении здесь будет вызов AuthService для проверки пользователя
   */
  async validate(_username: string, _password: string): Promise<any> {
    // TODO: Реализовать проверку через AuthService.validateUser()
    // Пока что возвращаем placeholder для структуры
    throw new UnauthorizedException(
      'Local strategy требует реализации AuthService',
    );
  }
}

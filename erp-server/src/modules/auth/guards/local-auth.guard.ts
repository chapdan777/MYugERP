import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard для защиты endpoint'а логина
 * Используется на /auth/login
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

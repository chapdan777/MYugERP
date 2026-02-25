import { Module, forwardRef } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Strategies
import {
  JwtStrategy,
  JwtRefreshStrategy,
  LocalStrategy,
} from './strategies';

// Service & Controller
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

/**
 * Модуль аутентификации
 * Предоставляет JWT стратегии (access + refresh) и локальную стратегию
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // JWT Module для Access токенов
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
    }),
    forwardRef(() => UsersModule),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    LocalStrategy,
  ],
  controllers: [AuthController],
  exports: [
    AuthService,
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule { }

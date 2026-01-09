import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './common/config/app.config';
import databaseConfig from './common/config/database.config';
import jwtConfig from './common/config/jwt.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AuditModule } from './modules/audit/audit.module';
import { ProductsModule } from './modules/products/products.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ConfigurationModule } from './modules/configuration/configuration.module';
import { AuditInterceptor } from './modules/audit/infrastructure/interceptors/audit.interceptor';
import { JwtAuthGuard } from './core/guards/jwt-auth.guard';
import { ProductionModule } from './modules/production/production.module';
import { WorkforceModule } from './modules/workforce/workforce.module';
import { AccountingModule } from './modules/accounting/accounting.module';

/**
 * Корневой модуль приложения ERP-сервера
 * Настроен согласно Clean Architecture и DDD принципам
 */
@Module({
  imports: [
    // Глобальная конфигурация с переменными окружения
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
      envFilePath: '.env',
    }),
    // TypeORM подключение к PostgreSQL
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [__dirname + '/modules/**/infrastructure/persistence/*.entity{.ts,.js}'],
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get<boolean>('database.logging'),
        autoLoadEntities: true,
      }),
    }),
    // Модуль аутентификации (JWT стратегии)
    AuthModule,
    // Модуль управления пользователями
    UsersModule,
    // Модуль аудита действий
    AuditModule,
    // Модуль управления продуктами
    ProductsModule,
    // Модуль управления свойствами продуктов
    PropertiesModule,
    // Модуль ценообразования
    PricingModule,
    // Модуль конфигурации шаблонов заказов
    // Модуль управления заказами
    OrdersModule,
    // Модуль конфигурации
    ConfigurationModule,
    // Модуль производства
    ProductionModule,
    // Модуль трудовых ресурсов
    WorkforceModule,
    // Модуль бухгалтерии
    AccountingModule,
    // Здесь будут подключаться остальные модули доменов
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Глобальная регистрация JwtAuthGuard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Глобальная регистрация AuditInterceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}

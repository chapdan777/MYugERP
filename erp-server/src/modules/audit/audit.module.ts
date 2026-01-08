import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogEntity } from './infrastructure/persistence/audit-log.entity';
import { AuditLogRepository } from './infrastructure/persistence/audit-log.repository';
import { AUDIT_LOG_REPOSITORY } from './domain/repositories/injection-tokens';

// Use Cases
import {
  CreateAuditLogUseCase,
  GetAuditLogsUseCase,
  GetUserAuditLogsUseCase,
} from './application/use-cases';

// Interceptor
import { AuditInterceptor } from './infrastructure/interceptors/audit.interceptor';

/**
 * Модуль аудита действий пользователей
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLogEntity]),
  ],
  providers: [
    // Repository
    {
      provide: AUDIT_LOG_REPOSITORY,
      useClass: AuditLogRepository,
    },
    // Use Cases
    CreateAuditLogUseCase,
    GetAuditLogsUseCase,
    GetUserAuditLogsUseCase,
    // Interceptor
    AuditInterceptor,
  ],
  exports: [
    CreateAuditLogUseCase,
    GetAuditLogsUseCase,
    GetUserAuditLogsUseCase,
    AuditInterceptor,
  ],
})
export class AuditModule {}

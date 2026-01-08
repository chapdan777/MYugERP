import { Injectable, Inject } from '@nestjs/common';
import { IAuditLogRepository, AuditLogFilters } from '../../domain/repositories/audit-log.repository.interface';
import { AUDIT_LOG_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { AuditLog } from '../../domain/entities/audit-log.entity';

/**
 * Use Case: Получение логов аудита с фильтрами
 */
@Injectable()
export class GetAuditLogsUseCase {
  constructor(
    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  async execute(filters?: AuditLogFilters): Promise<AuditLog[]> {
    return this.auditLogRepository.findAll(filters);
  }
}

/**
 * Use Case: Получение логов аудита пользователя
 */
@Injectable()
export class GetUserAuditLogsUseCase {
  constructor(
    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  async execute(userId: number, limit?: number): Promise<AuditLog[]> {
    return this.auditLogRepository.findByUserId(userId, limit);
  }
}

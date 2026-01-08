import { Injectable, Inject } from '@nestjs/common';
import { IAuditLogRepository } from '../../domain/repositories/audit-log.repository.interface';
import { AUDIT_LOG_REPOSITORY } from '../../domain/repositories/injection-tokens';
import { AuditLog } from '../../domain/entities/audit-log.entity';

/**
 * DTO для создания записи аудита
 */
export interface CreateAuditLogDto {
  userId: number;
  username: string;
  action: string;
  entityType: string;
  entityId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Use Case: Создание записи аудита
 */
@Injectable()
export class CreateAuditLogUseCase {
  constructor(
    @Inject(AUDIT_LOG_REPOSITORY)
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  async execute(dto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = AuditLog.create({
      userId: dto.userId,
      username: dto.username,
      action: dto.action,
      entityType: dto.entityType,
      entityId: dto.entityId,
      changes: dto.changes,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
    });

    return this.auditLogRepository.save(auditLog);
  }
}

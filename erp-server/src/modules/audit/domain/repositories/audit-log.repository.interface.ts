import { AuditLog } from '../entities/audit-log.entity';

/**
 * Интерфейс фильтров для поиска логов аудита
 */
export interface AuditLogFilters {
  userId?: number;
  username?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Abstract class репозитория для AuditLog
 */
export abstract class IAuditLogRepository {
  /**
   * Сохранить запись аудита
   */
  abstract save(auditLog: AuditLog): Promise<AuditLog>;

  /**
   * Найти запись по ID
   */
  abstract findById(id: number): Promise<AuditLog | null>;

  /**
   * Найти все записи с фильтрами
   */
  abstract findAll(filters?: AuditLogFilters): Promise<AuditLog[]>;

  /**
   * Найти записи пользователя
   */
  abstract findByUserId(userId: number, limit?: number): Promise<AuditLog[]>;

  /**
   * Найти записи по типу сущности
   */
  abstract findByEntityType(entityType: string, limit?: number): Promise<AuditLog[]>;

  /**
   * Найти записи по действию
   */
  abstract findByAction(action: string, limit?: number): Promise<AuditLog[]>;
}

import { AuditLog } from '../../domain/entities/audit-log.entity';
import { AuditLogEntity } from './audit-log.entity';

/**
 * Mapper для преобразования между доменной моделью AuditLog и TypeORM Entity
 */
export class AuditLogMapper {
  /**
   * Преобразование из TypeORM Entity в доменную модель
   */
  static toDomain(entity: AuditLogEntity): AuditLog {
    return AuditLog.restore({
      id: entity.id,
      userId: entity.userId,
      username: entity.username,
      action: entity.action,
      entityType: entity.entityType,
      entityId: entity.entityId,
      changes: entity.changes,
      ipAddress: entity.ipAddress,
      userAgent: entity.userAgent,
      createdAt: entity.createdAt,
    });
  }

  /**
   * Преобразование из доменной модели в TypeORM Entity
   */
  static toPersistence(domain: AuditLog): AuditLogEntity {
    const entity = new AuditLogEntity();
    
    const id = domain.getId();
    if (id !== undefined) {
      entity.id = id;
    }

    entity.userId = domain.getUserId();
    entity.username = domain.getUsername();
    entity.action = domain.getAction();
    entity.entityType = domain.getEntityType();
    entity.entityId = domain.getEntityId();
    entity.changes = domain.getChanges();
    entity.ipAddress = domain.getIpAddress();
    entity.userAgent = domain.getUserAgent();
    entity.createdAt = domain.getCreatedAt();

    return entity;
  }

  /**
   * Преобразование массива entities в массив доменных моделей
   */
  static toDomainList(entities: AuditLogEntity[]): AuditLog[] {
    return entities.map((entity) => this.toDomain(entity));
  }
}

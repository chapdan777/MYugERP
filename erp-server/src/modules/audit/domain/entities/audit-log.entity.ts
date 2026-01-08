/**
 * Доменная сущность AuditLog
 * Представляет запись аудита действий пользователей в системе
 */
export class AuditLog {
  private id?: number;
  private userId: number;
  private username: string;
  private action: string;
  private entityType: string;
  private entityId: string | null;
  private changes: string | null;
  private ipAddress: string | null;
  private userAgent: string | null;
  private createdAt: Date;

  private constructor(props: {
    id?: number;
    userId: number;
    username: string;
    action: string;
    entityType: string;
    entityId?: string | null;
    changes?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt?: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.username = props.username;
    this.action = props.action;
    this.entityType = props.entityType;
    this.entityId = props.entityId ?? null;
    this.changes = props.changes ?? null;
    this.ipAddress = props.ipAddress ?? null;
    this.userAgent = props.userAgent ?? null;
    this.createdAt = props.createdAt ?? new Date();
  }

  /**
   * Фабричный метод для создания новой записи аудита
   */
  static create(props: {
    userId: number;
    username: string;
    action: string;
    entityType: string;
    entityId?: string | null;
    changes?: Record<string, any> | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }): AuditLog {
    return new AuditLog({
      userId: props.userId,
      username: props.username,
      action: props.action,
      entityType: props.entityType,
      entityId: props.entityId,
      changes: props.changes ? JSON.stringify(props.changes) : null,
      ipAddress: props.ipAddress,
      userAgent: props.userAgent,
    });
  }

  /**
   * Фабричный метод для восстановления из БД
   */
  static restore(props: {
    id: number;
    userId: number;
    username: string;
    action: string;
    entityType: string;
    entityId: string | null;
    changes: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
  }): AuditLog {
    return new AuditLog(props);
  }

  // ==================== Геттеры ====================

  getId(): number | undefined {
    return this.id;
  }

  getUserId(): number {
    return this.userId;
  }

  getUsername(): string {
    return this.username;
  }

  getAction(): string {
    return this.action;
  }

  getEntityType(): string {
    return this.entityType;
  }

  getEntityId(): string | null {
    return this.entityId;
  }

  getChanges(): string | null {
    return this.changes;
  }

  getChangesObject(): Record<string, any> | null {
    if (!this.changes) return null;
    try {
      return JSON.parse(this.changes);
    } catch {
      return null;
    }
  }

  getIpAddress(): string | null {
    return this.ipAddress;
  }

  getUserAgent(): string | null {
    return this.userAgent;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}

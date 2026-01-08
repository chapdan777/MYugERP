/**
 * OrderLog entity - tracks all changes made to an order
 * Provides audit trail for order modifications
 */
export class OrderLog {
  private id?: number;
  private orderId: number;
  private userId: number;
  private userName: string;
  private action: string; // e.g., "created", "status_changed", "item_added", "price_recalculated"
  private entityType: string | null; // e.g., "order", "section", "item"
  private entityId: number | null; // ID of the affected entity
  private fieldName: string | null; // Field that changed
  private oldValue: string | null; // Previous value (JSON serialized)
  private newValue: string | null; // New value (JSON serialized)
  private description: string; // Human-readable description
  private timestamp: Date;

  private constructor(props: {
    id?: number;
    orderId: number;
    userId: number;
    userName: string;
    action: string;
    entityType?: string | null;
    entityId?: number | null;
    fieldName?: string | null;
    oldValue?: string | null;
    newValue?: string | null;
    description: string;
    timestamp?: Date;
  }) {
    this.id = props.id;
    this.orderId = props.orderId;
    this.userId = props.userId;
    this.userName = props.userName;
    this.action = props.action;
    this.entityType = props.entityType ?? null;
    this.entityId = props.entityId ?? null;
    this.fieldName = props.fieldName ?? null;
    this.oldValue = props.oldValue ?? null;
    this.newValue = props.newValue ?? null;
    this.description = props.description;
    this.timestamp = props.timestamp ?? new Date();
  }

  /**
   * Factory method to create a new log entry
   */
  static create(props: {
    orderId: number;
    userId: number;
    userName: string;
    action: string;
    entityType?: string | null;
    entityId?: number | null;
    fieldName?: string | null;
    oldValue?: string | null;
    newValue?: string | null;
    description: string;
  }): OrderLog {
    return new OrderLog(props);
  }

  /**
   * Factory method to restore from database
   */
  static restore(props: {
    id: number;
    orderId: number;
    userId: number;
    userName: string;
    action: string;
    entityType: string | null;
    entityId: number | null;
    fieldName: string | null;
    oldValue: string | null;
    newValue: string | null;
    description: string;
    timestamp: Date;
  }): OrderLog {
    return new OrderLog(props);
  }

  // Getters
  getId(): number | undefined {
    return this.id;
  }

  getOrderId(): number {
    return this.orderId;
  }

  getUserId(): number {
    return this.userId;
  }

  getUserName(): string {
    return this.userName;
  }

  getAction(): string {
    return this.action;
  }

  getEntityType(): string | null {
    return this.entityType;
  }

  getEntityId(): number | null {
    return this.entityId;
  }

  getFieldName(): string | null {
    return this.fieldName;
  }

  getOldValue(): string | null {
    return this.oldValue;
  }

  getNewValue(): string | null {
    return this.newValue;
  }

  getDescription(): string {
    return this.description;
  }

  getTimestamp(): Date {
    return this.timestamp;
  }
}

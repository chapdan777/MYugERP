/**
 * Base domain event interface
 * All domain events should implement this interface
 */
export interface IDomainEvent {
  occurredOn: Date;
  getEventName(): string;
}

/**
 * Abstract base class for domain events
 */
export abstract class DomainEvent implements IDomainEvent {
  public readonly occurredOn: Date;

  protected constructor() {
    this.occurredOn = new Date();
  }

  abstract getEventName(): string;
}

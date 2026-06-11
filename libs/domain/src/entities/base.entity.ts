import { DomainEvent } from '../events/domain-event.base';

export abstract class BaseEntity {
  private _domainEvents: DomainEvent[] = [];

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  public pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }

  public get hasDomainEvents(): boolean {
    return this._domainEvents.length > 0;
  }
}

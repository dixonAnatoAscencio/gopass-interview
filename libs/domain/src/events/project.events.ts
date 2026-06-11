import { DomainEvent } from './domain-event.base';

export class ProjectCreatedEvent extends DomainEvent {
  constructor(
    public readonly projectId: string,
    public readonly name: string,
    public readonly ownerId: string,
  ) {
    super('PROJECT_CREATED');
  }
}

export class ProjectArchivedEvent extends DomainEvent {
  constructor(
    public readonly projectId: string,
    public readonly archivedById: string,
  ) {
    super('PROJECT_ARCHIVED');
  }
}

export class ProjectRestoredEvent extends DomainEvent {
  constructor(
    public readonly projectId: string,
    public readonly restoredById: string,
  ) {
    super('PROJECT_RESTORED');
  }
}

export class ProjectMemberAddedEvent extends DomainEvent {
  constructor(
    public readonly projectId: string,
    public readonly userId: string,
    public readonly role: string,
    public readonly addedById: string,
  ) {
    super('PROJECT_MEMBER_ADDED');
  }
}

import { TaskPriority, TaskStatus } from '@gopass/contracts';
import { DomainEvent } from './domain-event.base';

export class TaskCreatedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly projectId: string,
    public readonly title: string,
    public readonly createdById: string,
  ) {
    super('TASK_CREATED');
  }
}

export class TaskStatusChangedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly projectId: string,
    public readonly fromStatus: TaskStatus | null,
    public readonly toStatus: TaskStatus,
    public readonly changedById: string,
    public readonly comment?: string,
  ) {
    super('TASK_STATUS_CHANGED');
  }
}

export class TaskCompletedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly projectId: string,
    public readonly completedById: string,
    public readonly completedAt: Date,
  ) {
    super('TASK_COMPLETED');
  }
}

export class TaskArchivedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly projectId: string,
    public readonly archivedById: string,
  ) {
    super('TASK_ARCHIVED');
  }
}

export class TaskOverdueDetectedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly projectId: string,
    public readonly dueDate: Date,
    public readonly assigneeId?: string | null,
  ) {
    super('TASK_OVERDUE_DETECTED');
  }
}

export class TaskPriorityChangedEvent extends DomainEvent {
  constructor(
    public readonly taskId: string,
    public readonly fromPriority: TaskPriority,
    public readonly toPriority: TaskPriority,
    public readonly changedById: string,
  ) {
    super('TASK_PRIORITY_CHANGED');
  }
}

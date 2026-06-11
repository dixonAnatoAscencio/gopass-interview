import { TaskStatus } from '@gopass/contracts';

const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS, TaskStatus.ARCHIVED],
  [TaskStatus.IN_PROGRESS]: [
    TaskStatus.BLOCKED,
    TaskStatus.IN_REVIEW,
    TaskStatus.DONE,
    TaskStatus.TODO,
    TaskStatus.ARCHIVED,
  ],
  [TaskStatus.BLOCKED]: [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.ARCHIVED],
  [TaskStatus.IN_REVIEW]: [
    TaskStatus.IN_PROGRESS,
    TaskStatus.DONE,
    TaskStatus.BLOCKED,
    TaskStatus.ARCHIVED,
  ],
  [TaskStatus.DONE]: [TaskStatus.ARCHIVED],
  [TaskStatus.ARCHIVED]: [TaskStatus.TODO],
};

export class TaskStatusVO {
  constructor(private readonly _value: TaskStatus) {}

  get value(): TaskStatus {
    return this._value;
  }

  canTransitionTo(nextStatus: TaskStatus): boolean {
    return VALID_TRANSITIONS[this._value]?.includes(nextStatus) ?? false;
  }

  transitionTo(nextStatus: TaskStatus): TaskStatusVO {
    if (!this.canTransitionTo(nextStatus)) {
      throw new Error(
        `Invalid status transition from ${this._value} to ${nextStatus}`,
      );
    }
    return new TaskStatusVO(nextStatus);
  }

  equals(other: TaskStatusVO): boolean {
    return this._value === other._value;
  }

  isTerminal(): boolean {
    return this._value === TaskStatus.ARCHIVED;
  }

  isCompleted(): boolean {
    return this._value === TaskStatus.DONE;
  }
}

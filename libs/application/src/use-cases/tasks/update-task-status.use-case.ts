import type { TaskDto } from '@gopass/contracts';
import { TaskStatus, OutboxEventType } from '@gopass/contracts';
import { TaskStatusVO } from '@gopass/domain';
import type { ITaskRepository } from '../../ports/task.repository.port';
import type { IOutboxRepository } from '../../ports/outbox.repository.port';

export interface UpdateTaskStatusInput {
  taskId: string;
  newStatus: TaskStatus;
  changedById: string;
  comment?: string;
}

export class UpdateTaskStatusUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly outboxRepository: IOutboxRepository,
  ) {}

  async execute(input: UpdateTaskStatusInput): Promise<TaskDto> {
    const task = await this.taskRepository.findById(input.taskId);
    if (!task) throw new Error(`Task not found: ${input.taskId}`);

    const currentStatus = new TaskStatusVO(task.status);
    const nextStatus = new TaskStatusVO(input.newStatus);

    if (!currentStatus.canTransitionTo(nextStatus.value)) {
      throw new Error(
        `Cannot transition from ${currentStatus.value} to ${nextStatus.value}`,
      );
    }

    const updatedTask = await this.taskRepository.updateStatus(
      input.taskId,
      input.newStatus,
      input.changedById,
      input.comment,
    );

    const eventType =
      input.newStatus === TaskStatus.DONE
        ? OutboxEventType.TASK_COMPLETED
        : OutboxEventType.TASK_STATUS_CHANGED;

    await this.outboxRepository.create({
      eventType,
      aggregateId: input.taskId,
      aggregateType: 'Task',
      payload: {
        taskId: input.taskId,
        projectId: task.projectId,
        fromStatus: task.status,
        toStatus: input.newStatus,
        changedById: input.changedById,
        comment: input.comment,
      },
    });

    return updatedTask;
  }
}

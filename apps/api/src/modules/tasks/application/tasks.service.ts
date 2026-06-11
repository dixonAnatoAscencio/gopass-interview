import { Injectable, NotFoundException } from '@nestjs/common';
import { TasksRepository } from '../infrastructure/tasks.repository';
import { OutboxRepository } from '../../infrastructure/outbox/outbox.repository';
import { ProjectsService } from '../../projects/application/projects.service';
import type { CreateTaskDto, UpdateTaskDto } from '@gopass/contracts';
import { TaskStatus, OutboxEventType } from '@gopass/contracts';
import { TaskStatusVO } from '@gopass/domain';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly outboxRepository: OutboxRepository,
    private readonly projectsService: ProjectsService,
  ) {}

  async create(projectId: string, dto: CreateTaskDto, createdById: string) {
    await this.projectsService.findOneOrThrow(projectId);

    const task = await this.tasksRepository.create({ ...dto, projectId, createdById });

    await this.outboxRepository.create({
      eventType: OutboxEventType.TASK_CREATED,
      aggregateId: task.id,
      aggregateType: 'Task',
      payload: { taskId: task.id, projectId, title: task.title, createdById },
    });

    return task;
  }

  async findByProject(projectId: string, query: Record<string, string>) {
    return this.tasksRepository.findByProject(projectId, query);
  }

  async findOverdue(_userId: string) {
    return this.tasksRepository.findOverdue();
  }

  async findOneOrThrow(id: string) {
    const task = await this.tasksRepository.findById(id);
    if (!task) throw new NotFoundException(`Task not found: ${id}`);
    return task;
  }

  async update(id: string, dto: UpdateTaskDto, _userId: string) {
    await this.findOneOrThrow(id);
    return this.tasksRepository.update(id, dto);
  }

  async updateStatus(id: string, newStatus: TaskStatus, changedById: string, comment?: string) {
    const task = await this.findOneOrThrow(id);

    const currentStatusVO = new TaskStatusVO(task.status);
    if (!currentStatusVO.canTransitionTo(newStatus)) {
      throw new Error(`Cannot transition from ${task.status} to ${newStatus}`);
    }

    const updatedTask = await this.tasksRepository.updateStatus(id, newStatus, changedById, comment);

    const eventType =
      newStatus === TaskStatus.DONE
        ? OutboxEventType.TASK_COMPLETED
        : OutboxEventType.TASK_STATUS_CHANGED;

    await this.outboxRepository.create({
      eventType,
      aggregateId: id,
      aggregateType: 'Task',
      payload: {
        taskId: id,
        projectId: task.projectId,
        fromStatus: task.status,
        toStatus: newStatus,
        changedById,
        comment,
      },
    });

    return updatedTask;
  }

  async archive(id: string, userId: string) {
    await this.findOneOrThrow(id);
    const task = await this.tasksRepository.archive(id, userId);

    await this.outboxRepository.create({
      eventType: OutboxEventType.TASK_ARCHIVED,
      aggregateId: id,
      aggregateType: 'Task',
      payload: { taskId: id, projectId: task.projectId, archivedById: userId },
    });

    return task;
  }

  async restore(id: string) {
    await this.findOneOrThrow(id);
    return this.tasksRepository.restore(id);
  }
}

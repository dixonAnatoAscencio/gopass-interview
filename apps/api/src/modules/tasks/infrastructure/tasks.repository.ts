import { Injectable } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { TaskStatus } from '@gopass/contracts';
import type { CreateTaskDto } from '../dto/create-task.dto';
import type { UpdateTaskDto } from '../dto/update-task.dto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  role: true,
} as const;

// Prisma enums and contracts enums share the same string values — safe to cast.
const toPrismaStatus = (s: TaskStatus) => s as unknown as $Enums.TaskStatus;
const toPrismaPriority = (p: string) => p as unknown as $Enums.TaskPriority;

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  private get include() {
    return {
      assignee: { select: USER_SELECT },
      createdBy: { select: USER_SELECT },
      statusHistory: {
        include: { changedBy: { select: USER_SELECT } },
        orderBy: { createdAt: 'desc' as const },
        take: 10,
      },
    };
  }

  async findById(id: string) {
    return this.prisma.task.findUnique({ where: { id }, include: this.include });
  }

  async findByProject(projectId: string, _query: Record<string, string>) {
    return this.prisma.task.findMany({
      where: { projectId },
      include: this.include,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOverdue() {
    return this.prisma.task.findMany({
      where: {
        dueDate: { lt: new Date() },
        status: { notIn: [toPrismaStatus(TaskStatus.DONE), toPrismaStatus(TaskStatus.ARCHIVED)] },
      },
      include: this.include,
    });
  }

  async create(data: CreateTaskDto & { projectId: string; createdById: string }) {
    return this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority ? toPrismaPriority(data.priority) : 'MEDIUM',
        projectId: data.projectId,
        assigneeId: data.assigneeId,
        createdById: data.createdById,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        estimatedHours: data.estimatedHours,
        tags: data.tags ?? [],
        statusHistory: {
          create: { toStatus: toPrismaStatus(TaskStatus.TODO), changedById: data.createdById },
        },
      },
      include: this.include,
    });
  }

  async update(id: string, data: UpdateTaskDto) {
    return this.prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority ? toPrismaPriority(data.priority) : undefined,
        assigneeId: data.assigneeId,
        dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
        estimatedHours: data.estimatedHours,
        tags: data.tags,
      },
      include: this.include,
    });
  }

  async updateStatus(id: string, status: TaskStatus, changedById: string, comment?: string) {
    const task = await this.prisma.task.findUniqueOrThrow({ where: { id } });

    return this.prisma.task.update({
      where: { id },
      data: {
        status: toPrismaStatus(status),
        completedAt: status === TaskStatus.DONE ? new Date() : undefined,
        statusHistory: {
          create: {
            fromStatus: task.status,
            toStatus: toPrismaStatus(status),
            comment,
            changedById,
          },
        },
      },
      include: this.include,
    });
  }

  async archive(id: string, archivedById: string) {
    return this.prisma.task.update({
      where: { id },
      data: { status: toPrismaStatus(TaskStatus.ARCHIVED), archivedAt: new Date(), archivedById },
      include: this.include,
    });
  }

  async restore(id: string) {
    return this.prisma.task.update({
      where: { id },
      data: { status: toPrismaStatus(TaskStatus.TODO), archivedAt: null, archivedById: null },
      include: this.include,
    });
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { TASK_OVERDUE_CHECK_CRON } from '@gopass/shared';
import { OutboxEventType } from '@gopass/contracts';

@Injectable()
export class OverdueTasksService {
  private readonly logger = new Logger(OverdueTasksService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(TASK_OVERDUE_CHECK_CRON)
  async detectOverdueTasks() {
    const overdueTasks = await this.prisma.task.findMany({
      where: {
        dueDate: { lt: new Date() },
        status: { notIn: ['DONE', 'ARCHIVED'] },
      },
      select: { id: true, projectId: true, dueDate: true, assigneeId: true },
    });

    if (overdueTasks.length === 0) return;

    this.logger.log(`[overdue] detected ${overdueTasks.length} overdue tasks`);

    const outboxEvents = overdueTasks.map((task) => ({
      eventType: OutboxEventType.TASK_OVERDUE_DETECTED,
      aggregateId: task.id,
      aggregateType: 'Task',
      payload: {
        taskId: task.id,
        projectId: task.projectId,
        dueDate: task.dueDate,
        assigneeId: task.assigneeId,
      },
      status: 'PENDING' as const,
      retryCount: 0,
    }));

    await this.prisma.outboxEvent.createMany({ data: outboxEvents, skipDuplicates: false });
  }
}

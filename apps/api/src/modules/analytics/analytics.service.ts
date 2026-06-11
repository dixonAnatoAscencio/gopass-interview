import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getGlobalSummary(userId: string) {
    const projectIds = await this.getUserProjectIds(userId);

    const [totalTasks, statusCounts, overdueTasks] = await Promise.all([
      this.prisma.task.count({ where: { projectId: { in: projectIds } } }),
      this.prisma.task.groupBy({ by: ['status'], where: { projectId: { in: projectIds } }, _count: true }),
      this.prisma.task.count({
        where: {
          projectId: { in: projectIds },
          dueDate: { lt: new Date() },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          status: { notIn: ['DONE', 'ARCHIVED'] as any },
        },
      }),
    ]);

    const byStatus = Object.fromEntries(statusCounts.map((s) => [s.status, s._count]));
    const completed = (byStatus['DONE'] ?? 0) as number;
    const completionRate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

    return { totalProjects: projectIds.length, totalTasks, byStatus, overdueTasks, completionRate };
  }

  async getProjectAnalytics(projectId: string) {
    const [totalTasks, statusCounts, priorityCounts, overdueTasks] = await Promise.all([
      this.prisma.task.count({ where: { projectId } }),
      this.prisma.task.groupBy({ by: ['status'], where: { projectId }, _count: true }),
      this.prisma.task.groupBy({ by: ['priority'], where: { projectId }, _count: true }),
      this.prisma.task.count({
        where: {
          projectId,
          dueDate: { lt: new Date() },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          status: { notIn: ['DONE', 'ARCHIVED'] as any },
        },
      }),
    ]);

    const byStatus = Object.fromEntries(statusCounts.map((s) => [s.status, s._count]));
    const byPriority = Object.fromEntries(priorityCounts.map((p) => [p.priority, p._count]));
    const completed = (byStatus['DONE'] ?? 0) as number;
    const completionRate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

    return { projectId, totalTasks, byStatus, byPriority, overdueTasks, completionRate };
  }

  private async getUserProjectIds(userId: string): Promise<string[]> {
    const memberships = await this.prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true },
    });
    return memberships.map((m) => m.projectId);
  }
}

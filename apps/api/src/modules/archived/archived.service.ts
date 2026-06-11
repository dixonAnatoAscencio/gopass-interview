import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { ProjectStatus, TaskStatus } from '@gopass/contracts';

@Injectable()
export class ArchivedService {
  constructor(private readonly prisma: PrismaService) {}

  async getArchivedProjects(userId: string) {
    return this.prisma.project.findMany({
      where: {
        status: ProjectStatus.ARCHIVED as unknown as Parameters<typeof this.prisma.project.findMany>[0]['where']['status'],
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      include: {
        owner: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
        _count: { select: { tasks: true, members: true } },
      },
      orderBy: { archivedAt: 'desc' },
    });
  }

  async getArchivedTasks(userId: string) {
    const memberProjectIds = await this.prisma.projectMember
      .findMany({ where: { userId }, select: { projectId: true } })
      .then((r) => r.map((m) => m.projectId));

    return this.prisma.task.findMany({
      where: {
        status: TaskStatus.ARCHIVED as unknown as Parameters<typeof this.prisma.task.findMany>[0]['where']['status'],
        projectId: { in: memberProjectIds },
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
        createdBy: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
      },
      orderBy: { archivedAt: 'desc' },
    });
  }
}

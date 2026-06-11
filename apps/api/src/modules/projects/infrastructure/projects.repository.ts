import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { CreateProjectDto, UpdateProjectDto, PaginationQuery } from '@gopass/contracts';
import { ProjectStatus } from '@gopass/contracts';
import { buildPaginatedResponse, getPaginationOffset } from '@gopass/shared';

@Injectable()
export class ProjectsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
        _count: { select: { members: true, tasks: true } },
      },
    });
  }

  async findMany(query: PaginationQuery, userId: string) {
    const { page = 1, limit = 20 } = query;
    const skip = getPaginationOffset(page, limit);

    const where = {
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    };

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
          _count: { select: { members: true, tasks: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }

  async create(data: CreateProjectDto & { ownerId: string }) {
    return this.prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        ownerId: data.ownerId,
        members: {
          create: { userId: data.ownerId, role: 'ADMIN' },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
        _count: { select: { members: true, tasks: true } },
      },
    });
  }

  async update(id: string, data: UpdateProjectDto) {
    return this.prisma.project.update({
      where: { id },
      data: { name: data.name, description: data.description, color: data.color },
      include: {
        owner: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } },
        _count: { select: { members: true, tasks: true } },
      },
    });
  }

  async archive(id: string, archivedById: string) {
    return this.prisma.project.update({
      where: { id },
      data: {
        status: ProjectStatus.ARCHIVED as unknown as Parameters<typeof this.prisma.project.update>[0]['data']['status'],
        archivedAt: new Date(),
        archivedById,
      },
    });
  }

  async restore(id: string, _restoredById: string) {
    return this.prisma.project.update({
      where: { id },
      data: {
        status: ProjectStatus.ACTIVE as unknown as Parameters<typeof this.prisma.project.update>[0]['data']['status'],
        archivedAt: null,
        archivedById: null,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.project.delete({ where: { id } });
  }
}

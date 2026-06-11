import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  async create(data: {
    email: string;
    name: string;
    passwordHash: string;
    role?: string;
  }): Promise<User> {
    return this.prisma.user.create({ data: data as Parameters<typeof this.prisma.user.create>[0]['data'] });
  }
}

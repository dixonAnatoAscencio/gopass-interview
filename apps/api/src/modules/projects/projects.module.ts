import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './application/projects.service';
import { ProjectsRepository } from './infrastructure/projects.repository';
import { OutboxRepository } from '../infrastructure/outbox/outbox.repository';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectsRepository, OutboxRepository],
  exports: [ProjectsService, ProjectsRepository],
})
export class ProjectsModule {}

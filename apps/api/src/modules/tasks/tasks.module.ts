import { Module } from '@nestjs/common';
import { TasksController, TaskOperationsController } from './tasks.controller';
import { TasksService } from './application/tasks.service';
import { TasksRepository } from './infrastructure/tasks.repository';
import { OutboxRepository } from '../infrastructure/outbox/outbox.repository';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [ProjectsModule],
  controllers: [TasksController, TaskOperationsController],
  providers: [TasksService, TasksRepository, OutboxRepository],
  exports: [TasksService, TasksRepository],
})
export class TasksModule {}

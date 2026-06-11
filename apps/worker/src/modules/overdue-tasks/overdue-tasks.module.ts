import { Module } from '@nestjs/common';
import { OverdueTasksService } from './overdue-tasks.service';

@Module({
  providers: [OverdueTasksService],
})
export class OverdueTasksModule {}

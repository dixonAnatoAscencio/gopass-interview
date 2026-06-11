import { Module } from '@nestjs/common';
import { ArchivedController } from './archived.controller';
import { ArchivedService } from './archived.service';

@Module({
  controllers: [ArchivedController],
  providers: [ArchivedService],
})
export class ArchivedModule {}

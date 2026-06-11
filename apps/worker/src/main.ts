import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { WorkerModule } from './worker.module';

async function bootstrap() {
  const app = await NestFactory.create(WorkerModule, { bufferLogs: true });
  const logger = new Logger('Worker');

  await app.init();
  logger.log('🔧 Worker started — processing background jobs');
}

bootstrap();

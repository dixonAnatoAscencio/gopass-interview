import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { validateConfig } from './config/config.validation';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { ArchivedModule } from './modules/archived/archived.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './modules/infrastructure/prisma/prisma.module';
import {
  RATE_LIMIT_DEFAULT_TTL,
  RATE_LIMIT_DEFAULT_LIMIT,
} from '@gopass/shared';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
      validate: validateConfig,
      envFilePath: ['.env', 'apps/api/.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: RATE_LIMIT_DEFAULT_TTL,
        limit: RATE_LIMIT_DEFAULT_LIMIT,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    AnalyticsModule,
    RecommendationsModule,
    ArchivedModule,
    AuditModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

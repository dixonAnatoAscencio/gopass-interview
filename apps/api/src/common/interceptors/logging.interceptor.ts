import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CORRELATION_ID_HEADER } from '@gopass/shared';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const correlationId = request.headers[CORRELATION_ID_HEADER] as string | undefined;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.log(`[${correlationId ?? 'no-id'}] ${method} ${url} +${duration}ms`);
        },
        error: () => {
          const duration = Date.now() - startTime;
          this.logger.error(`[${correlationId ?? 'no-id'}] ${method} ${url} failed +${duration}ms`);
        },
      }),
    );
  }
}

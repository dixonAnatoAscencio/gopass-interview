export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_SORT_ORDER = 'desc';

export const JWT_ACCESS_TOKEN_EXPIRY = '15m';
export const JWT_REFRESH_TOKEN_EXPIRY = '7d';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const CORRELATION_ID_HEADER = 'x-correlation-id';
export const REQUEST_ID_HEADER = 'x-request-id';

export const IDEMPOTENCY_KEY_HEADER = 'x-idempotency-key';
export const IDEMPOTENCY_KEY_TTL_SECONDS = 86400;

export const OUTBOX_PROCESSING_BATCH_SIZE = 50;
export const OUTBOX_MAX_RETRIES = 3;
export const OUTBOX_RETRY_DELAY_MS = 5000;
export const DLQ_THRESHOLD = 5;

export const TASK_OVERDUE_CHECK_CRON = '0 * * * *';
export const OUTBOX_PROCESS_CRON = '*/30 * * * * *';
export const RECOMMENDATION_GENERATE_CRON = '0 8 * * *';

export const RATE_LIMIT_DEFAULT_TTL = 60000;
export const RATE_LIMIT_DEFAULT_LIMIT = 100;
export const RATE_LIMIT_AUTH_LIMIT = 10;
export const RATE_LIMIT_AI_LIMIT = 5;

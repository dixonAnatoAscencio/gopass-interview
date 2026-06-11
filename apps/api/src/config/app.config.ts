import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  apiPrefix: process.env['API_PREFIX'] ?? 'api',
  corsOrigin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173',
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  appName: process.env['APP_NAME'] ?? 'GoPass API',
}));

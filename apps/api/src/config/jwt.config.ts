import { registerAs } from '@nestjs/config';
import { JWT_ACCESS_TOKEN_EXPIRY, JWT_REFRESH_TOKEN_EXPIRY } from '@gopass/shared';

export default registerAs('jwt', () => ({
  secret: process.env['JWT_SECRET'] ?? 'super-secret-change-in-production',
  accessExpiresIn: process.env['JWT_ACCESS_EXPIRES_IN'] ?? JWT_ACCESS_TOKEN_EXPIRY,
  refreshSecret: process.env['JWT_REFRESH_SECRET'] ?? 'super-refresh-secret-change-in-production',
  refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] ?? JWT_REFRESH_TOKEN_EXPIRY,
}));

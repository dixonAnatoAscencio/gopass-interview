export const env = {
  apiBaseUrl: import.meta.env['VITE_API_BASE_URL'] ?? 'http://localhost:3000/api/v1',
  appName: import.meta.env['VITE_APP_NAME'] ?? 'GoPass',
  environment: import.meta.env['MODE'] ?? 'development',
} as const;

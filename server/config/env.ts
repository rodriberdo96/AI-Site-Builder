const getRequiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
};

const parseOrigins = (value: string | undefined): string[] =>
  value?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? [];

const parsePort = (value: string | undefined): number => {
  if (!value) return 3000;
  const port = Number(value);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT must be a positive integer');
  }
  return port;
};

export const env = {
  databaseUrl: getRequiredEnv('DATABASE_URL'),
  betterAuthUrl: getRequiredEnv('BETTER_AUTH_URL'),
  betterAuthSecret: getRequiredEnv('BETTER_AUTH_SECRET'),
  trustedOrigins: parseOrigins(process.env.TRUSTED_ORIGINS),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parsePort(process.env.PORT),
};

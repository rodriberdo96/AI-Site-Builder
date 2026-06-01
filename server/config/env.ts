const getRequiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
};

const parseOrigins = (value: string | undefined): string[] =>
  value?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? [];

export const env = {
  databaseUrl: getRequiredEnv('DATABASE_URL'),
  betterAuthUrl: getRequiredEnv('BETTER_AUTH_URL'),
  betterAuthSecret: getRequiredEnv('BETTER_AUTH_SECRET'),
  trustedOrigins: parseOrigins(process.env.TRUSTED_ORIGINS),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: (() => {
    const port = Number(process.env.PORT ?? 3000);
    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
      throw new Error('Invalid PORT environment variable');
    }
    return port;
  })(),
};

import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

export const config = {
  // Database
  databaseUrl: requireEnv('DATABASE_URL'),

  // Server
  port: parseInt(process.env.PORT || '3010', 10),
  nodeEnv: optionalEnv('NODE_ENV', 'development'),

  // JWT
  jwtSecret: requireEnv('JWT_SECRET'),

  // CORS
  corsOrigin: optionalEnv('CORS_ORIGIN', 'http://localhost:5173'),

  // Neo4j
  neo4jUri: optionalEnv('NEO4J_URI', 'bolt://localhost:7687'),
  neo4jUser: optionalEnv('NEO4J_USER', 'neo4j'),
  neo4jPassword: optionalEnv('NEO4J_PASSWORD', 'password'),
} as const;

export type Config = typeof config;

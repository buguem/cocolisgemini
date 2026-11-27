import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

// Singleton Prisma connecté à Lakebase Postgres (Neon pooled DATABASE_URL)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: env.databaseUrl,
      },
    },
    log: env.nodeEnv === 'development' ? ['error', 'warn'] : ['error'],
  });

if (env.nodeEnv !== 'production') {
  globalForPrisma.prisma = prisma;
}

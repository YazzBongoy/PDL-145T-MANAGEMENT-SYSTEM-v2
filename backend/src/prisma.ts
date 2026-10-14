import { PrismaClient } from '@prisma/client';

// Single shared PrismaClient instance.
//
// This module intentionally has NO side effects (no server start, no
// process.exit) so that tests and any other consumer can import the client
// without booting the HTTP server. In non-production we cache the instance on
// globalThis to avoid exhausting connections during hot reload / repeated
// imports.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;

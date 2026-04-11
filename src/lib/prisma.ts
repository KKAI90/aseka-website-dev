import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
}

// Keep backwards compatibility
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrisma() as any)[prop];
  },
});

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// Amplify Gen1 SSR Lambda may not inject env vars — use explicit fallback
const DB_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  "postgres://postgres.eftgkvtpvaixipazrjnf:hCobYi0zI7whYPlx@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true";

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    datasources: { db: { url: DB_URL } },
    log: ["error"],
  });
}

export const prisma = globalForPrisma.prisma;

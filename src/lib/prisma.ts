import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const DB_URL =
  process.env.DATABASE_URL ||
  "postgresql://aseka_admin:Aseka2026Dev@aseka-dev-db.cktabbrhafl9.ap-northeast-1.rds.amazonaws.com:5432/postgres?sslmode=require";

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: { db: { url: DB_URL } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

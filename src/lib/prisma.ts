import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// This used to fall back to a hardcoded connection string — a real database username and
// password committed straight into source control (found via a pre-prod security audit;
// visible in git history across several old commits, including ones literally titled
// "update DB password"). Any real credential that's ever been committed must be treated as
// permanently compromised even after this line is removed, since git history still holds it
// for anyone with repo read access — this code fix does not undo that exposure on its own.
//
// Fail loudly instead: if DATABASE_URL isn't set, the app must not silently connect to some
// other database (or leak that database's credential in the bundle/logs) — it should refuse
// to start.
const DB_URL = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
if (!DB_URL) {
  throw new Error("DATABASE_URL (or POSTGRES_PRISMA_URL/POSTGRES_URL) is not set — refusing to start without an explicit database connection.");
}

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    datasources: { db: { url: DB_URL } },
    log: ["error"],
  });
}

export const prisma = globalForPrisma.prisma;
